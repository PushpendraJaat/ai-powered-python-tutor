import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'


export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })
    const url = request.nextUrl

    if (token &&
        (
            url.pathname.startsWith('/auth/signin') ||
            url.pathname.startsWith('/auth/signup')
        )
    ) {
        return NextResponse.redirect(new URL('/chat', request.url))
    }
    if (!token && 
        (
            url.pathname.startsWith('/chat') ||
            url.pathname.startsWith('/settings') ||
            url.pathname.startsWith('/user-data')
        )
    ) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
}


export const config = {
    matcher: [
        '/auth/signin',
        '/auth/signup',
        '/chat',
        '/settings',
        '/user-data',
    ]
}