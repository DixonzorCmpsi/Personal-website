import { NextRequest, NextResponse } from 'next/server';

const SECURE_HOSTS = new Set(['deetalk.win', 'www.deetalk.win']);

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();

  if (host && SECURE_HOSTS.has(host) && forwardedProto === 'http') {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = 'https:';
    secureUrl.hostname = host;
    secureUrl.port = '';
    return NextResponse.redirect(secureUrl, 308);
  }

  const response = NextResponse.next();

  if (host && SECURE_HOSTS.has(host)) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
