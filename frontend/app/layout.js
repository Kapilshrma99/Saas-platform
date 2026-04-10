import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'LaunchPad | Multi-tenant SaaS Builder',
  description: 'The ultimate platform for launching and scaling your business online.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-700">
        <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-2xl font-bold tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-transform group-hover:rotate-12">L</span>
              <span className="gradient-text">LaunchPad</span>
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              <Link href="/features" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">Features</Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">Pricing</Link>
              <Link href="/docs" className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">Documentation</Link>
              <Link href="/dashboard" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>

        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
          <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs">L</span>
                <span>LaunchPad</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                Empowering entrepreneurs to build and scale their digital presence with ease and style.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-indigo-600">Features</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">Templates</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">Payments</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-indigo-600">About</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">Blog</Link></li>
                <li><Link href="#" className="hover:text-indigo-600">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-7xl border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} LaunchPad Inc. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

