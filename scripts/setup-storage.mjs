import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
    console.log('Setting up Supabase Storage buckets...')

    const buckets = [
        { name: 'public-assets', public: true },
        { name: 'secure-logs', public: false }
    ]

    for (const bucket of buckets) {
        const { data: existingBucket, error: getError } = await supabase.storage.getBucket(bucket.name)

        if (getError && getError.message !== 'The resource was not found' && getError.message !== 'Bucket not found') {
            console.error(`Error checking bucket ${bucket.name}:`, getError.message)
            continue
        }

        if (existingBucket && !getError) {
            console.log(`Bucket "${bucket.name}" already exists.`)
        } else {
            console.log(`Creating bucket "${bucket.name}"...`)
            const { data, error } = await supabase.storage.createBucket(bucket.name, {
                public: bucket.public,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
            })

            if (error) {
                console.error(`Error creating bucket ${bucket.name}:`, error.message)
            } else {
                console.log(`Bucket "${bucket.name}" created successfully.`)
            }
        }
    }

    console.log('Storage setup complete.')
}

setupStorage()
