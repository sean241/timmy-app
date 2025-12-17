import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const { data: { user } } = await supabase.auth.getUser()

    // Route Protection Logic
    const path = request.nextUrl.pathname

    // 1. Protection for /admin routes
    if (path.startsWith('/admin')) {

        // Define public routes within /admin
        const isPublicAdminRoute =
            path === '/admin' ||
            path.startsWith('/admin/signup') ||
            path.startsWith('/admin/forgot-password') ||
            path.startsWith('/admin/update-password');

        // If user is NOT authenticated
        if (!user) {
            // And trying to access a protected route
            if (!isPublicAdminRoute) {
                // Redirect to login page
                const url = request.nextUrl.clone()
                url.pathname = '/admin'
                return NextResponse.redirect(url)
            }
        }

        // If user IS authenticated
        if (user) {
            // And trying to access the login page
            if (path === '/admin') {
                // Redirect to dashboard
                const url = request.nextUrl.clone()
                url.pathname = '/admin/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
