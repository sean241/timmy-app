export interface Employee {
    id: string;
    organization_id: string;
    site_id?: string | null;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    job_title?: string | null;
    hourly_rate?: number | null;
    pin_code: string;
    whatsapp_number?: string | null;
    email?: string | null;
    is_active?: boolean | null;
    archived_at?: string | null;
    created_at?: string | null;
    is_whatsapp_verified?: boolean;
    whatsapp_verified_at?: string | null;
    phone_code?: string;
    full_phone_formatted?: string;
}

export type LogType = 'IN' | 'OUT';
export type LogStatus = 'PENDING' | 'SYNCED';

export interface Log {
    id?: number; // Auto-incremented by Dexie
    employee_id: string;
    employee_name: string; // Denormalized for easier display
    organization_id: string;
    site_id: string;
    kiosk_id: string;
    type: LogType;
    timestamp: string; // ISO string
    photo: string; // Base64
    status: LogStatus;
}
