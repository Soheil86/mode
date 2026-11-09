import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fast redirect for visitors with no session cookie. This only checks that the
// cookie exists: the real auth check is requireUser() in each page.
export function proxy(request: NextRequest) {
  if (!request.cookies.has('auth_token')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/issues/:path*'],
}
