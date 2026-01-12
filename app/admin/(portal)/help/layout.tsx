import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timmy - Aide',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
