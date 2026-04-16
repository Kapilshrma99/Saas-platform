import './globals.css';
import AppShell from '../components/AppShell';
import { headers } from 'next/headers';

export const metadata = {
  title: 'LaunchPad | Multi-tenant SaaS Builder',
  description: 'The ultimate platform for launching and scaling your business online.'
};

export default function RootLayout({ children }) {
  const headerStore = headers();
  const hidePlatformChrome = headerStore.get('x-tenant-site') === '1';

  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-700">
        <AppShell hidePlatformChrome={hidePlatformChrome}>{children}</AppShell>
      </body>
    </html>
  );
}
