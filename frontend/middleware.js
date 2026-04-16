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
  const requestHeaders = new Headers(request.headers);

  if (pathname.startsWith('/site')) {
    requestHeaders.set('x-tenant-site', '1');
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
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
  requestHeaders.set('x-tenant-site', '1');
  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
