// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/uploaded_files/')) {
    const filename = request.nextUrl.pathname.replace('/uploaded_files/', '');
    return NextResponse.rewrite(new URL(`/api/serve/${filename}`, request.url));
  }
}

export const config = {
  matcher: '/uploaded_files/:filename*',
}