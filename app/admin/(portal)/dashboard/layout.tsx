import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timmy - Tableau de bord',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
