'use server'

import { createClient } from '@supabase/supabase-js'
import { Employee } from '@/types'

interface KioskLog {
    employee_id: string;
    organization_id: string;
    site_id: string;
    kiosk_id: string;
    type: 'IN' | 'OUT';
    timestamp: string;
    photo?: string;
    [key: string]: any;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function fetchOrganizationEmployees(organizationId: string) {
    if (!supabaseUrl || !supabaseServiceKey) return { error: 'Server config missing' }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, pin_code, avatar_url, job_title')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

    if (error) {
        console.error('Error fetching employees:', error)
        return { error: 'Failed to fetch employees' }
    }

    return { success: true, employees: data }
}

export async function pushKioskLogs(logs: KioskLog[]) {
    if (!supabaseUrl || !supabaseServiceKey) return { error: 'Server config missing' }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // In a real app, we would upload photos to Storage here
    // For now, we'll strip the base64 photo to avoid payload issues if the DB column isn't text/large
    // or we assume the DB can handle it (not recommended for production)
    // Let's assume we just save the metadata for now to prove the sync works

    const logsToInsert = logs.map(log => ({
        employee_id: log.employee_id,
        organization_id: log.organization_id,
        site_id: log.site_id,
        kiosk_id: log.kiosk_id,
        type: log.type === 'IN' ? 'CHECK_IN' : 'CHECK_OUT',
        timestamp: log.timestamp,
        // photo_url: ... upload logic would go here
        created_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
        .from('attendance_logs')
        .insert(logsToInsert)
        .select()

    if (error) {
        console.error('Error pushing logs:', error)
        return { error: 'Failed to push logs' }
    }

    // Try to update heartbeat using the last kiosk_id found in the batch
    const uniqueKioskIds = Array.from(new Set(logsToInsert.map(l => l.kiosk_id).filter(id => !!id))) as string[]
    // We update all unique kiosks involved (usually just one)
    for (const kid of uniqueKioskIds) {
        // Run in background / parallel
        updateKioskHeartbeat(kid).catch(e => console.error("Heartbeat update failed during push logs", e))
    }

    return { success: true, count: data.length }
}

export async function fetchKioskConfig(kioskId: string) {
    if (!supabaseUrl || !supabaseServiceKey) return { error: 'Server config missing' }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
        .from('kiosks')
        .select(`
            name,
            organization_id,
            site_id,
            organizations ( name, settings ),
            sites ( name )
        `)
        .eq('id', kioskId)
        .single()

    if (error) {
        console.error('Error fetching kiosk config:', error)
        return { error: 'Failed to fetch kiosk config' }
    }

    // Flatten the result for easier consumption
    // Update heartbeat
    await updateKioskHeartbeat(kioskId)

    return {
        success: true,
        config: {
            kiosk_name: data.name,
            organization_name: (data.organizations as unknown as { name: string })?.name,
            organization_settings: (data.organizations as unknown as { settings: any })?.settings,
            site_name: (data.sites as unknown as { name: string })?.name,
            organization_id: data.organization_id,
            site_id: data.site_id
        }
    }
}

export async function logAppEvent(organizationId: string, action: string, details: Record<string, any> = {}) {
    if (!supabaseUrl || !supabaseServiceKey) return { error: 'Server config missing' }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we can extract a kiosk_id from details to update heartbeat
    if (details && details.kiosk_id && details.kiosk_id !== 'unknown') {
        // We catch errors here to not fail the log event if heartbeat fails
        updateKioskHeartbeat(details.kiosk_id).catch(e => console.error("Failed to update heartbeat in logAppEvent", e))
    }

    const { error } = await supabase
        .from('app_logs')
        .insert({
            organization_id: organizationId,
            action,
            details,
            level: 'WARNING',
            // user_id left null: Inserted by system/service_role
        })

    if (error) {
        console.error('Error logging app event:', error)
        return { error: 'Failed to log event' }
    }

    return { success: true }
}

async function updateKioskHeartbeat(kioskId: string) {
    if (!supabaseUrl || !supabaseServiceKey) return

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // We update the last_heartbeat_at timestamp
    const { error } = await supabase
        .from('kiosks')
        .update({ last_heartbeat_at: new Date().toISOString() })
        .eq('id', kioskId)

    if (error) {
        // We log but don't throw, as heartbeat failure shouldn't stop the main logic
        console.error(`Failed to update heartbeat for kiosk ${kioskId}:`, error)
    }
}
