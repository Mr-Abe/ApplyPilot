import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabasePublicConfig } from '@/lib/env';

const authPages = new Set(['/login', '/signup']);

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith('/app');
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();

  if (!config) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (user && authPages.has(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}
