import './globals.css';

export const metadata = {
  title: 'SaaS Website Builder',
  description: 'Multi-tenant website builder platform'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
