import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Ignore les erreurs ESLint (ex: no-unused-vars) pendant le build
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignore les erreurs de type (ex: any) pendant le build
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'gsdsdacwkkjymunbrpis.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default withPWA(nextConfig);