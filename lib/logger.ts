import { supabase } from "@/lib/supabase";

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
    action: string;
    details?: any;
    level?: LogLevel;
    userId?: string;
    orgId?: string;
}

export const Logger = {
    /**
     * Log an event to the database
     */
    log: async ({ action, details, level = 'INFO', userId, orgId }: LogEntry) => {
        try {
            // Get current user if not provided
            let currentUserId = userId;
            if (!currentUserId) {
                const { data: { session } } = await supabase.auth.getSession();
                currentUserId = session?.user?.id;
            }

            // If we have a user but no orgId, try to fetch it
            let currentOrgId = orgId;
            if (currentUserId && !currentOrgId) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', currentUserId)
                    .single();

                if (profile) {
                    currentOrgId = profile.organization_id;
                }
            }

            // Fire and forget - don't await to avoid blocking UI
            supabase.from('app_logs').insert({
                action,
                details,
                level,
                user_id: currentUserId,
                organization_id: currentOrgId
            }).then(({ error }) => {
                if (error) console.error("Failed to write log:", error);
            });

            // Also log to console for local dev
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${level}] ${action}`, details);
            }

        } catch (err) {
            console.error("Logger error:", err);
        }
    },

    info: (action: string, details?: any) => Logger.log({ action, details, level: 'INFO' }),
    warn: (action: string, details?: any) => Logger.log({ action, details, level: 'WARN' }),
    error: (action: string, details?: any) => Logger.log({ action, details, level: 'ERROR' })
};
