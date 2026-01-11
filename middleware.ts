import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/auth', '/api/webhooks'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes without authentication
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // If authenticated and trying to access login, redirect to dashboard
    if (pathname === '/login') {
      try {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        if (session) {
          const dashboardUrl = new URL('/', request.url);
          return NextResponse.redirect(dashboardUrl);
        }
      } catch {
        // Continue to login
      }
    }
    return NextResponse.next();
  }

  // Check authentication for all other routes (including API)
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If not authenticated, redirect to login for pages, return 401 for API
    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', session.user.id);
      requestHeaders.set('x-user-email', session.user.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, protect the route
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
