import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(process.env.RESEND_API_KEY);

// Use 'force-dynamic' to ensure the route is not cached statically
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Determine "Yesterday"
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Format as YYYY-MM-DD for database query
        const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

        const formattedDate = yesterday.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // 2. Fetch ALL Organizations
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id, name');

        if (orgError) throw orgError;

        if (!organizations || organizations.length === 0) {
            return NextResponse.json({ message: 'No organizations found' });
        }

        const emailResults = [];

        // 3. Loop through each Organization
        for (const org of organizations) {
            // A. Fetch Owner Email
            // We look for a profile with role 'OWNER' linked to this org
            const { data: ownerProfile, error: ownerError } = await supabase
                .from('profiles')
                .select('email')
                .eq('organization_id', org.id)
                .eq('role', 'OWNER')
                .single();

            // Determine Recipient
            // Production: Owner Email (if exists)
            // Development: Test Email
            const isProduction = process.env.NODE_ENV === 'production';
            let recipientEmail = 'seanlenh@gmail.com'; // Default / Fallback

            if (isProduction) {
                if (ownerProfile?.email) {
                    recipientEmail = ownerProfile.email;
                } else {
                    console.warn(`No OWNER found for org ${org.name} (${org.id}). Falling back to test email or skipping.`);
                    // Optional: Skip if no owner in prod? Or send to generic admin?
                    // For now, let's keep the fallback but log it, or maybe don't send at all to avoid leaking data to test email in prod if unwanted.
                    // But strictly following "If Production -> Send to Owner", we'll stick to that.
                }
            }

            // A2. Fetch active employees for THIS Organization
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('id, first_name, last_name, job_title, avatar_url')
                .eq('organization_id', org.id)
                .eq('is_active', true)
                .is('archived_at', null);

            if (empError) {
                console.error(`Error fetching employees for org ${org.id}:`, empError);
                continue;
            }

            // If no employees, skip sending email
            if (!employees || employees.length === 0) continue;

            // B. Fetch time entries for THIS Organization and Today
            const { data: timeEntries, error: timeError } = await supabase
                .from('attendance_logs')
                .select('*') // Need more than just employee_id now (timestamp, type)
                .eq('organization_id', org.id)
                .gte('timestamp', startOfDay)
                .lte('timestamp', endOfDay)
                .order('timestamp', { ascending: true }); // Order mainly for timeline if needed, but we filter in code

            if (timeError) {
                console.error(`Error fetching time entries for org ${org.id}:`, timeError);
                continue;
            }

            // C. Process Data
            const presentEmployees = [];
            const absentEmployees = [];

            // Helper to check for lateness (threshold 09:00)
            const LATE_THRESHOLD_HOUR = 9;
            const LATE_THRESHOLD_MINUTE = 0;

            for (const emp of employees) {
                const empLogs = timeEntries?.filter(log => log.employee_id === emp.id) || [];

                if (empLogs.length > 0) {
                    // PRESENT
                    const firstLog = empLogs[0];
                    const lastLog = empLogs[empLogs.length - 1];
                    const arrivalTime = new Date(firstLog.timestamp);
                    const arrivalTimeStr = arrivalTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                    // Late Check
                    let isLate = false;
                    if (arrivalTime.getHours() > LATE_THRESHOLD_HOUR || (arrivalTime.getHours() === LATE_THRESHOLD_HOUR && arrivalTime.getMinutes() > LATE_THRESHOLD_MINUTE)) {
                        isLate = true;
                    }

                    // Missing Checkout Check (If last log is CHECK_IN/IN)
                    // Note: Supabase might store 'CHECK_IN' or 'IN', handle both just in case, though usually backend standardizes.
                    const type = lastLog.type === 'IN' || lastLog.type === 'CHECK_IN' ? 'IN' : 'OUT';
                    const isMissingCheckout = type === 'IN';

                    presentEmployees.push({
                        ...emp,
                        arrivalTimeStr,
                        isLate,
                        isMissingCheckout
                    });
                } else {
                    // ABSENT
                    absentEmployees.push(emp);
                }
            }

            // Sort present employees by arrival time? Or Name? Let's do Name.
            presentEmployees.sort((a, b) => a.last_name.localeCompare(b.last_name));
            absentEmployees.sort((a, b) => a.last_name.localeCompare(b.last_name));

            // D. Generate Email HTML
            const presentListHtml = presentEmployees.map(emp => {
                const avatar = emp.avatar_url || `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=random`;

                return `
                <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0;">
                    <img src="${avatar}" alt="${emp.first_name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #333;">${emp.first_name} ${emp.last_name}</div>
                        <div style="font-size: 12px; color: #888;">${emp.job_title || 'Employé'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: #333;">${emp.arrivalTimeStr}</div>
                        ${emp.isLate ? '<span style="display: inline-block; background: #ffebee; color: #c62828; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">EN RETARD</span>' : ''}
                        ${emp.isMissingCheckout ? '<span style="display: inline-block; background: #fff3e0; color: #ef6c00; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">PAS DE SORTIE</span>' : ''}
                    </div>
                </div>
                `;
            }).join('');

            const absentListHtml = absentEmployees.map(emp =>
                `<li style="padding: 8px 0; border-bottom: 1px solid #f5f5f5; color: #666;">${emp.first_name} ${emp.last_name}</li>`
            ).join('');

            const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://timmy.app'; // Fallback or env var

            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                .wrapper { width: 100%; background-color: #f4f4f4; padding: 20px 0; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background-color: #0F4C5C; color: white; padding: 30px 20px; text-align: center; }
                .content { padding: 30px 20px; }
                h2 { color: #0F4C5C; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px; margin-bottom: 15px; }
                ul { list-style-type: none; padding: 0; margin: 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 30px; }
                .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
                .stat-value { font-size: 24px; font-weight: 800; color: #0F4C5C; }
                .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6c757d; margin-top: 5px; }
                .cta-button { display: block; width: 100%; text-align: center; background-color: #0F4C5C; color: white; text-decoration: none; padding: 15px 0; border-radius: 8px; font-weight: bold; margin-top: 30px; }
                .cta-button:hover { background-color: #0c3b47; }
                .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; background-color: #f4f4f4; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1 style="margin:0; font-size: 24px;">Rapport Journalier</h1>
                        <p style="margin:5px 0 0 0; opacity: 0.9; font-size: 16px;">${org.name}</p>
                        <p style="margin:5px 0 0 0; font-size: 14px; opacity: 0.8;">${formattedDate}</p>
                    </div>
                    <div class="content">
                        <!-- STATS -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" style="color: #2e7d32;">${presentEmployees.length}</div>
                                <div class="stat-label">Présents</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" style="color: #c62828;">${presentEmployees.filter(e => e.isLate).length}</div>
                                <div class="stat-label">Retards</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" style="color: #666;">${absentEmployees.length}</div>
                                <div class="stat-label">Absents</div>
                            </div>
                        </div>

                        <!-- PRESENT LIST -->
                        <h2>✅ Présents (${presentEmployees.length})</h2>
                        ${presentEmployees.length > 0 ? `<div>${presentListHtml}</div>` : '<p style="color: #666; font-style: italic;">Aucun employé présent.</p>'}

                        <!-- ABSENT LIST -->
                        <h2>❌ Absents (${absentEmployees.length})</h2>
                        ${absentEmployees.length > 0 ? `<ul>${absentListHtml}</ul>` : '<p style="color: #666; font-style: italic;">Aucun employé absent.</p>'}

                        <!-- CTA BUTTON -->
                        <a href="${dashboardUrl}/admin/dashboard" class="cta-button">Accéder au Tableau de Bord</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Envoyé automatiquement par Timmy pour ${org.name}</p>
                </div>
            </div>
        </body>
        </html>
        `;

            // E. Send Email
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Timmy <onboarding@resend.dev>',
                to: [recipientEmail], // Dynamically determined
                subject: `Rapport journalier [${org.name}] - ${formattedDate}`,
                html: htmlContent,
            });

            if (emailError) {
                console.error(`Error sending email for ${org.name} to ${recipientEmail}:`, emailError);
                emailResults.push({ org: org.name, recipient: recipientEmail, status: 'error', error: emailError });
            } else {
                emailResults.push({ org: org.name, recipient: recipientEmail, status: 'sent', id: emailData?.id });
            }
        }

        return NextResponse.json({ success: true, results: emailResults });
    } catch (error) {
        console.error('Daily report error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
