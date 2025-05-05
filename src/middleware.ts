import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const S3_POST_URL =
    process.env.S3_BUCKET_NAME && process.env.AWS_REGION
        ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
        : undefined;

export const config = {
    matcher: [
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
    const cspHeader = `
      default-src 'self'${S3_POST_URL ? ` ${S3_POST_URL}` : ''};
      connect-src 'self' blob: ${S3_POST_URL ? ` ${S3_POST_URL}` : ''};
      style-src 'self' 'unsafe-inline';
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
      media-src 'self' blob: https:;
      img-src 'self' blob: data: https:;
      script-src 'self' 'nonce-${nonce}' 'unsafe-inline' blob:;
    `;

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
