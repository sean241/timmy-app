export interface OrganizationSettings {
    general: {
        sector: string;
        timezone: string;
        currency: string;
        logo_url?: string;
    };
    payroll: {
        cycle: 'MONTHLY_1' | 'MONTHLY_15' | 'WEEKLY' | 'BIWEEKLY';
        format: 'XLSX' | 'CSV' | 'PDF';
        use_matricule: boolean;
    };
    attendance: {
        tolerance_minutes: 0 | 5 | 10 | 15;
        rounding_rule: 'EXACT' | '5MIN' | '15MIN' | '30MIN';
        auto_break: {
            enabled: boolean;
            duration_minutes: 30 | 45 | 60 | 90;
            threshold_hours: number;
        };
        overtime: {
            enabled: boolean;
            daily_threshold: number;
            weekly_threshold: number;
        };
    };
    planning: {
        week_start: 'MONDAY' | 'SUNDAY' | 'SATURDAY';
        start_time?: string; // e.g. "08:00"
        end_time?: string;   // e.g. "17:00"
        working_days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[];
        night_shift: {
            start: string;
            end: string;
        };
    };
    notifications: {
        channels: {
            email: boolean;
            whatsapp: boolean;
        };
        alerts: {
            late_arrival: boolean;
            early_departure: boolean;
            overtime: boolean;
            no_show: {
                enabled: boolean;
                threshold_minutes: number;
            };
            device_offline: {
                enabled: boolean;
                threshold_minutes: number;
            };
        };
        reports: {
            daily_digest: boolean;
            weekly_summary: boolean;
        };
        employee_comms: {
            send_planning: boolean;
            shift_reminder: boolean;
        };
    };
    features: {
        beta_access: boolean;
        allow_geofencing: boolean;
    };
    integrations?: {
        whatsapp: {
            enabled: boolean;
            quota_limit: number;
            quota_used: number;
        };
        google_sheets: {
            enabled: boolean;
            sheet_id?: string;
            last_sync?: string;
        };
        calendar: {
            enabled: boolean;
            provider?: 'GOOGLE' | 'OUTLOOK';
        };
    };
}
