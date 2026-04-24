import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    if (isLoginPage) {
      if (isAuth) {
        if (token.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        return NextResponse.redirect(new URL('/chat', req.url))
      }
      return null
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }
        return !!token
      }
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/login", "/chat", "/riwayat"],
}
