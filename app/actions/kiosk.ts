'use server'

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';

export async function verifyKioskCode(code: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase Service Key')
        return { error: 'Configuration serveur incomplète' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // 1. Find the kiosk with this code
    console.log(`Verifying code: ${code}`);
    const { data: kiosk, error: fetchError } = await supabase
        .from('kiosks')
        .select('id, name, organization_id, site_id, organizations(name, logo_url), sites(name), status')
        .eq('pairing_code', code)
        .single()

    console.log('Fetch result:', { kiosk, fetchError });

    if (fetchError || !kiosk) {
        return { error: 'Code invalide ou expiré (Introuvable)' }
    }

    if (kiosk.status !== 'PENDING') {
        return { error: `Code invalide ou expiré (Statut: ${kiosk.status})` }
    }

    // 2. Generate a secret device_id
    const deviceId = `sk_${uuidv4().replace(/-/g, '')}`;

    // 3. Update the kiosk
    const { error: updateError } = await supabase
        .from('kiosks')
        .update({
            device_id: deviceId,
            pairing_code: null, // Clear the code
            status: 'ONLINE',
            last_heartbeat_at: new Date().toISOString()
        })
        .eq('id', kiosk.id)

    if (updateError) {
        console.error('Error updating kiosk:', updateError)
        return { error: 'Erreur lors de l\'activation' }
    }

    // 4. Return the config
    return {
        success: true,
        config: {
            kiosk_id: kiosk.id,
            kiosk_name: kiosk.name,
            device_id: deviceId,
            organization_id: kiosk.organization_id,
            organization_name: (kiosk.organizations as any)?.name,
            organization_logo: (kiosk.organizations as any)?.logo_url,
            site_id: kiosk.site_id,
            site_name: (kiosk.sites as any)?.name
        }
    }
}
