import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Timmy - Configuration Site',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
