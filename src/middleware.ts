import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './server/auth';
 
export async function middleware(request: NextRequest) { 
  const session = await auth()
  
  if (session?.user && (session.user.role !== "admin") && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
  };