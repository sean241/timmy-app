'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client with Service Role Key
// This allows bypassing RLS to generate Signed URLs for private buckets
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getSignedUrlAction(path: string): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin.storage
            .from('secure-logs')
            .createSignedUrl(path, 3600); // 1 hour validity

        if (error) {
            console.error('Error generating signed URL (Server Action):', error.message);
            return null;
        }

        return data.signedUrl;
    } catch (err) {
        console.error('Unexpected error in getSignedUrlAction:', err);
        return null;
    }
}
