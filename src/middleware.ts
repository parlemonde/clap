import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - static (public static files)
         * - _next/static (next static files)
         * - _next/image (next image optimization files)
         * - favicon (favicon files)
         */
        {
            source: '/((?!api|static|_next/static|_next/image|favicon).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
};

export function middleware(request: NextRequest) {
    if (process.env.NODE_ENV !== 'production') {
        return NextResponse.next();
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = createCspHeaders(nonce);

    // Replace newline characters and spaces
    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    return response;
}

// CSP headers here is set based on Next.js recommendations:
// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
export const createCspHeaders = (nonce: string) => {
    const defaultsCSPHeaders = `
      default-src 'self';
      style-src 'self' 'unsafe-inline';
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
      media-src 'self' blob: https:;
    `;

    // when environment is preview enable unsafe-inline scripts for vercel preview feedback/comments feature
    // and whitelist vercel's domains based on:
    // https://vercel.com/docs/workflow-collaboration/comments/specialized-usage#using-a-content-security-policy
    // and white-list vitals.vercel-insights
    // based on: https://vercel.com/docs/speed-insights#content-security-policy
    if (process.env?.VERCEL_ENV === 'preview') {
        return `
        ${defaultsCSPHeaders}
        script-src 'self' https://vercel.live/ https://vercel.com 'unsafe-inline' https: http: blob:;
        connect-src 'self' https://vercel.live/ https://vercel.com https://vitals.vercel-insights.com https://sockjs-mt1.pusher.com/ wss://ws-mt1.pusher.com/ blob:;
        img-src 'self' blob: data: https:;
        frame-src 'self' blob: https://vercel.live/ https://vercel.com;
        `;
    }

    // for production environment white-list vitals.vercel-insights
    // based on: https://vercel.com/docs/speed-insights#content-security-policy
    return `
        ${defaultsCSPHeaders}
        script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://vercel.live/ blob:;
        img-src 'self' blob: data: https:;
        connect-src 'self' blob: https://vercel.live/;
        frame-src 'self' blob: https://vercel.live/;
        `;
};
