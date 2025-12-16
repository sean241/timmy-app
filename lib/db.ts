import Dexie, { Table } from 'dexie';
import { Employee, Log } from '@/types';

class TimmyDatabase extends Dexie {
    local_employees!: Table<Employee, string>; // ID is string (UUID)
    local_logs!: Table<Log, number>;
    local_config!: Table<{ key: string; value: unknown }, string>;
    cloud_sites!: Table<{ id?: number; name: string; activation_code: string; address?: string; timezone?: string; geofencing?: boolean; archived?: boolean }, number>;
    cloud_employees!: Table<{ id?: number; name: string; pin: string; site_id?: number; job_title?: string; whatsapp?: string; email?: string; photo_url?: string; archived?: boolean }, number>;
    cloud_kiosks!: Table<{ id?: number; name: string; site_id: number; otp: string; status: 'active' | 'revoked'; last_sync_at: string; app_version: string; config?: { photo_required: boolean; badge_required: boolean; signature_required: boolean } }, number>;

    constructor() {
        super('TimmyDB');
        this.version(3).stores({
            local_employees: 'id, pin', // Legacy
            local_logs: '++id, employee_id, status, timestamp',
            local_config: 'key',
            cloud_sites: '++id, name, activation_code',
            cloud_employees: '++id, name, pin, site_id'
        });

        this.version(4).stores({
            cloud_sites: '++id, name, activation_code, archived'
        }).upgrade(tx => {
            return tx.table("cloud_sites").toCollection().modify(site => {
                site.archived = false;
            });
        });

        this.version(5).stores({
            cloud_kiosks: '++id, name, site_id, status'
        });

        this.version(6).stores({
            cloud_employees: '++id, name, pin, site_id, archived'
        }).upgrade(tx => {
            return tx.table("cloud_employees").toCollection().modify(emp => {
                emp.archived = false;
            });
        });

        this.version(7).stores({
            cloud_employees: '++id, name, pin, site_id, archived'
        });

        // Version 8: Update local_employees to match Supabase schema
        this.version(8).stores({
            local_employees: 'id, pin_code' // Changed pin to pin_code
        });
    }
}

export const db = new TimmyDatabase();
