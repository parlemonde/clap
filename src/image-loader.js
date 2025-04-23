'use client';

export default function myImageLoader({ src, width, quality }) {
    if (typeof src !== 'string') {
        return '';
    }
    if (src.startsWith('/api/images/')) {
        return `${src}?w=${width}&q=${quality || 75}`;
    } else {
        return src; // no optimization
    }
}
