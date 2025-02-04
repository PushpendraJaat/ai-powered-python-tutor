import withAuth from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(){
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({token, req}) => {
        const { pathname } = req.nextUrl;

        //allow path
        if( pathname.startsWith("/api/auth") || pathname === "/auth/signin" || pathname === "/auth/signup")
          {
          return true
        }

        //
        if(pathname === "/"){
          return true
        }
        //
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}