import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timmy - Pointages',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
