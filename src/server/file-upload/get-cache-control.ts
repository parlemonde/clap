/**
 * Public media is written with UUID-like names and treated as immutable. Browsers
 * and shared caches can keep it for a year because a content change should use a
 * new URL.
 */
export const PUBLIC_IMMUTABLE_MEDIA_CACHE_CONTROL = 'public, max-age=31536000, s-maxage=31536000, immutable';

/**
 * Private user media can be reused by the viewer's browser for one day, but
 * not by CloudFront or another shared cache. s-maxage=0 targets shared caches,
 * stale-if-error=0 prevents stale private content from being served during origin
 * errors, and must-revalidate forces a freshness check after browser expiry.
 */
export const PRIVATE_USER_MEDIA_CACHE_CONTROL = 'private, max-age=86400, s-maxage=0, stale-if-error=0, must-revalidate';

/**
 * Missing, unauthorized, or otherwise unsafe media responses should not be
 * stored anywhere.
 */
export const NO_STORE_MEDIA_CACHE_CONTROL = 'no-store';

/**
 * Signed media URLs can be cached by shared caches only until their signature
 * expires. Browsers revalidate every time because max-age=0.
 */
export function getSignedMediaCacheControl(expires: string | null): string {
    if (!expires) {
        return NO_STORE_MEDIA_CACHE_CONTROL;
    }

    const expiresAt = Number(expires);
    if (!Number.isFinite(expiresAt)) {
        return NO_STORE_MEDIA_CACHE_CONTROL;
    }

    const remainingSeconds = Math.floor((expiresAt - Date.now()) / 1000);
    if (remainingSeconds <= 0) {
        return NO_STORE_MEDIA_CACHE_CONTROL;
    }

    return `public, max-age=0, s-maxage=${remainingSeconds}, stale-if-error=0, must-revalidate`;
}
