// --- GENERAL ---
// --- GENERAL ---
export const COMPANY_SECTORS = [
    { value: 'BTP', labelKey: 'settings.general.sector.btp' },
    { value: 'RESTAURATION', labelKey: 'settings.general.sector.restauration' },
    { value: 'RETAIL', labelKey: 'settings.general.sector.retail' },
    { value: 'SANTE', labelKey: 'settings.general.sector.health' },
    { value: 'LOGISTIQUE', labelKey: 'settings.general.sector.logistics' },
    { value: 'SERVICES', labelKey: 'settings.general.sector.services' },
    { value: 'AUTRE', labelKey: 'settings.general.sector.other' }
] as const;

export const COUNTRIES = [
    { code: 'GA', name: 'Gabon', dial_code: '+241', flag: '🇬🇦', currency: 'XAF' },
    { code: 'CI', name: 'Côte d\'Ivoire', dial_code: '+225', flag: '🇨🇮', currency: 'XOF' },
    { code: 'SN', name: 'Sénégal', dial_code: '+221', flag: '🇸🇳', currency: 'XOF' },
    { code: 'CM', name: 'Cameroun', dial_code: '+237', flag: '🇨🇲', currency: 'XAF' },
    { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷', currency: 'EUR' },
] as const;

// --- PAIE ---
export const PAYROLL_CYCLES = [
    { value: 'MONTHLY_1', labelKey: 'settings.general.payrollCycles.monthly' },
    { value: 'MONTHLY_15', labelKey: 'settings.general.payrollCycles.midMonth' },
    { value: 'WEEKLY', labelKey: 'settings.general.payrollCycles.weekly' },
    { value: 'BIWEEKLY', labelKey: 'settings.general.payrollCycles.biweekly' }
] as const;

export const EXPORT_FORMATS = [
    { value: 'XLSX', labelKey: 'settings.general.export.xlsx' },
    { value: 'CSV', labelKey: 'settings.general.export.csv' },
    { value: 'PDF', labelKey: 'settings.general.export.pdf' }
] as const;

// --- ATTENDANCE (POINTAGE) ---
export const LATENESS_TOLERANCES = [
    { value: 0, labelKey: 'settings.general.latenessTolerances.none' },
    { value: 5, labelKey: 'settings.general.latenessTolerances.min5' },
    { value: 10, labelKey: 'settings.general.latenessTolerances.min10' },
    { value: 15, labelKey: 'settings.general.latenessTolerances.min15' }
] as const;

export const ROUNDING_RULES = [
    { value: 'EXACT', labelKey: 'settings.general.rounding.exact' },
    { value: '5MIN', labelKey: 'settings.general.rounding.min5' },
    { value: '15MIN', labelKey: 'settings.general.rounding.min15' },
    { value: '30MIN', labelKey: 'settings.general.rounding.min30' }
] as const;

export const AUTO_BREAK_DURATION = [
    { value: 30, labelKey: 'settings.general.lunchDuration.min30' },
    { value: 45, labelKey: 'settings.general.lunchDuration.min45' },
    { value: 60, labelKey: 'settings.general.lunchDuration.hour1' },
    { value: 90, labelKey: 'settings.general.lunchDuration.min90' }
] as const;

// --- PLANNING ---
export const WEEK_START_DAYS = [
    { value: 'MONDAY', labelKey: 'settings.general.week.monday' },
    { value: 'SUNDAY', labelKey: 'settings.general.week.sunday' },
    { value: 'SATURDAY', labelKey: 'settings.general.week.saturday' }
] as const;

export const DAYS_OF_WEEK = [
    { id: 'MON', labelKey: 'settings.general.shortWeekDays.0', fullKey: 'days.mon.full' },
    { id: 'TUE', labelKey: 'settings.general.shortWeekDays.1', fullKey: 'days.tue.full' },
    { id: 'WED', labelKey: 'settings.general.shortWeekDays.2', fullKey: 'days.wed.full' },
    { id: 'THU', labelKey: 'settings.general.shortWeekDays.3', fullKey: 'days.thu.full' },
    { id: 'FRI', labelKey: 'settings.general.shortWeekDays.4', fullKey: 'days.fri.full' },
    { id: 'SAT', labelKey: 'settings.general.shortWeekDays.5', fullKey: 'days.sat.full' },
    { id: 'SUN', labelKey: 'settings.general.shortWeekDays.6', fullKey: 'days.sun.full' },
] as const;

// --- NOTIFICATIONS ---
export const ALERT_THRESHOLDS = [
    { value: 15, labelKey: 'settings.general.alert.min15' },
    { value: 30, labelKey: 'settings.general.alert.min30' },
    { value: 60, labelKey: 'settings.general.alert.min60' },
    { value: 120, labelKey: 'settings.general.alert.min120' }
] as const;

// Helper function to get translated label
export const getLabel = (t: any, keyPath: string): string => {
    const keys = keyPath.split('.');
    let current = t;
    for (const key of keys) {
        if (current[key] === undefined) return keyPath;
        current = current[key];
    }
    return current as string;
};
