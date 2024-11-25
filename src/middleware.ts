import { type NextRequest } from 'next/server';
 
export default function middleware(request: NextRequest) {
  // const session = request.auth
  
  // if (session?.user && (session.user.role !== "admin") && request.nextUrl.pathname.startsWith('/dashboard')) {
    // return NextResponse.redirect(new URL('/', request.url))
  // }
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