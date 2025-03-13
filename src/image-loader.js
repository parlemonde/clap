/* eslint-disable no-undef */
'use client';

export default function myImageLoader({ src, width, quality }) {
    if (typeof src !== 'string') {
        return '';
    }
    if (process.env.NEXT_PUBLIC_STATIC_CONTENT_URL && src.startsWith('/api/images/')) {
        return `${process.env.NEXT_PUBLIC_STATIC_CONTENT_URL}/${src.slice(5)}?w=${width}&q=${quality || 75}`;
    } else if (src.startsWith('/api/images/')) {
        return `${src}?w=${width}&q=${quality || 75}`;
    } else {
        return src; // no optimization
    }
}
