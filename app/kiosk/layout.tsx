import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timmy - Kiosque',
    manifest: '/manifest.json',
    icons: {
        icon: '/icon.png',
    },
};

export const viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
