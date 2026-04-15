import { NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

function getSubdomain(hostname) {
  const parts = hostname.split('.');

  if (hostname.endsWith('.localhost') && parts.length === 2) {
    return parts[0];
  }

  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/site') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hostname = request.headers.get('host')?.split(':')[0] || '';
  const subdomain = getSubdomain(hostname);

  if (!subdomain || subdomain === 'www' || subdomain === 'localhost') {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/site/${subdomain}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
