import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/booking/:path*',
    '/seat-selection/:path*',
    '/confirmation/:path*',
    '/my-bookings/:path*',
  ],
};