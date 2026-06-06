import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/', '/tickets', '/tickets/new']
const authRoutes = ['/auth/login', '/auth/signup']

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const session = request.cookies.get('session')?.value

  const isProtected = protectedRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  )
  const isAuthPage = authRoutes.some(route =>
    path === route || path.startsWith(route + '/')
  )

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
