import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Flexible Content Renderer',
  description: 'Standalone flexible content renderer with mobile/desktop toggle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}