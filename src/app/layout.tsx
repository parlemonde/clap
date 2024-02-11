import type { Metadata } from 'next';
import * as React from 'react';

import './globals.css';

export const metadata: Metadata = {
    title: 'Clap!',
    description: 'Clap! is web application to create storyboard and videos script for an educational purpose.',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
