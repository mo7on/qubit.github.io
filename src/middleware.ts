import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initializeScheduler } from '@/lib/scheduler';

export function middleware(request: NextRequest) {
  // Initialize the scheduler on server start
  initializeScheduler();
  
  // Continue with the request
  return NextResponse.next();
}

// Only run the middleware on specific paths to avoid unnecessary executions
export const config = {
  matcher: ['/api/:path*'],
};