'use server'

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend';
import { InviteUserEmail } from '../../InviteUserEmail';
import { render } from '@react-email/render';

export async function inviteUser(email: string, role: string, organizationId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const resendApiKey = process.env.RESEND_API_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase Config')
        return { error: 'Configuration serveur incomplète (Clé Service manquante)' }
    }

    if (!resendApiKey) {
        console.error('Missing Resend API Key')
        return { error: 'Configuration email incomplète (Clé Resend manquante)' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const resend = new Resend(resendApiKey);

    try {
        // 1. Generate Invite Link
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    role: role,
                    organization_id: organizationId
                }
            }
        });

        if (linkError) {
            console.error('Error generating link:', linkError)
            return { error: linkError.message }
        }

        const inviteLink = linkData.properties.action_link;

        // 2. Render Email Template
        const emailHtml = await render(
            InviteUserEmail({
                inviteLink: inviteLink,
                inviterName: "L'équipe Timmy", // Could be dynamic if we passed inviter name
                organizationName: "votre organisation", // Could fetch org name if needed
                role: role
            })
        );

        // 3. Send Email via Resend
        const { error: resendError } = await resend.emails.send({
            from: 'Timmy <onboarding@resend.dev>', // Update this with your verified domain in production
            to: email,
            subject: 'Invitation à rejoindre Timmy',
            html: emailHtml
        });

        if (resendError) {
            console.error('Error sending email:', resendError)
            return { error: 'Erreur lors de l\'envoi de l\'email' }
        }

        return { success: true }

    } catch (err) {
        console.error("Unexpected error in inviteUser:", err);
        return { error: "Une erreur inattendue est survenue" }
    }
}
