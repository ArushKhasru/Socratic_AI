import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/signin', '/signup'];
const AUTH_COOKIE_KEYS = ['token', 'sa_session_token'];
const FALLBACK_API_ORIGIN = 'http://localhost:5000';

const isProtectedPath = (pathname: string) => {
  if (PUBLIC_PATHS.includes(pathname)) return false;
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/sessions') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/shared-topics')
  );
};

const getApiHostname = () => {
  const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_ORIGIN).trim();

  try {
    return new URL(configuredApiUrl).hostname;
  } catch {
    return '';
  }
};

export function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const apiHostname = getApiHostname();
  const frontendHostname = request.nextUrl.hostname;

  if (apiHostname && apiHostname !== frontendHostname) {
    return NextResponse.next();
  }

  const hasAuthToken = AUTH_COOKIE_KEYS.some((key) => request.cookies.has(key));
  if (!hasAuthToken) {
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
