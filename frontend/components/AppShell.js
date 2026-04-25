import Link from 'next/link';

const navLinkClass =
  'text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const primaryLinkClass =
  'rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-[background-color,box-shadow,transform] duration-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

export default function AppShell({ children, hidePlatformChrome = false }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip To Content
      </a>

      {!hidePlatformChrome ? (
        <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-2xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-transform duration-200 group-hover:rotate-12">
                L
              </span>
              <span className="gradient-text text-balance">LaunchPad</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
              <Link href="/pricing" className={navLinkClass}>
                Pricing
              </Link>
              <Link href="/auth" className={navLinkClass}>
                Sign In
              </Link>
              <Link href="/dashboard" className={primaryLinkClass}>
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
      ) : null}

      <main id="main-content">{children}</main>

      {!hidePlatformChrome ? (
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs text-white">L</span>
                <span>LaunchPad</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                Empowering entrepreneurs to build and scale their digital presence with ease and style.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/" className={navLinkClass}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className={navLinkClass}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className={navLinkClass}>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>
                  <Link href="/auth" className={navLinkClass}>
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className={navLinkClass}>
                    Plans
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className={navLinkClass}>
                    Manage Site
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-7xl border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} LaunchPad Inc. All rights reserved.
          </div>
        </footer>
      ) : null}
    </>
  );
}
