import { supabase } from "./supabase";

/**
 * Utility for Supabase Storage Operations in Timmy App
 */

export const BUCKETS = {
    PUBLIC_ASSETS: 'public-assets',
    SECURE_LOGS: 'secure-logs',
};

/**
 * Uploads a file to a specific bucket and returns the public URL or relative path
 * @param bucket Bucket name
 * @param path Path within the bucket (e.g., 'logos/org_123.png')
 * @param file File object or Blob
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File | Blob
): Promise<{ url: string | null; error: any }> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                upsert: true,
                cacheControl: '3600',
            });

        if (error) throw error;

        // For public-assets, we usually want the public URL immediately
        if (bucket === BUCKETS.PUBLIC_ASSETS) {
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            return { url: publicUrlData.publicUrl, error: null };
        }

        // For secure-logs, we return the path to be used later with createSignedUrl
        return { url: data.path, error: null };
    } catch (error: any) {
        console.error(`Upload error in ${bucket}:`, error.message);
        return { url: null, error };
    }
}

/**
 * Generates a signed URL for private assets (secure-logs)
 * @param path Path returned during upload
 * @param expiresIn Seconds until link expires (default 1 hour)
 */
export async function getSecureUrl(path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
        .from(BUCKETS.SECURE_LOGS)
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error('Error generating signed URL:', error.message);
        return null;
    }

    return data.signedUrl;
}

/**
 * Deletes a file from a bucket
 */
export async function deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
        console.error(`Delete error in ${bucket}:`, error.message);
        return false;
    }
    return true;
}
