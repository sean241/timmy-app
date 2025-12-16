'use server'

import { createClient } from '@supabase/supabase-js'

export async function inviteUser(email: string, role: string, organizationId: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase Service Key')
        return { error: 'Configuration serveur incomplète (Clé Service manquante)' }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
            role: role,
            organization_id: organizationId
        }
    })

    if (error) {
        console.error('Error inviting user:', error)
        return { error: error.message }
    }

    return { success: true }
}
