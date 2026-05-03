import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/signin', '/signup'];
const AUTH_COOKIE_KEYS = ['token', 'sa_session_token'];

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

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
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
