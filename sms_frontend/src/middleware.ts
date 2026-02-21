import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Extract token from cookies
    const token = request.cookies.get('access_token')?.value;

    // Paths requiring authentication
    const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboardPath && !token) {
        // If attempting to visit dashboard without token, redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If visiting login while already authenticated, skip to dashboard
    if (request.nextUrl.pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Ensure the middleware executes on targeted robust routes only.
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
