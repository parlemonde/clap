export function getDefaultDirectives(): { [directiveName: string]: Iterable<string> } {
    return {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'block-all-mixed-content': [],
        'font-src': ["'self'"],
        'frame-ancestors': ["'self'"],
        'connect-src': ["'self'", 'http:', 'https:', 'data:', 'blob:'],
        'img-src': ["'self'", 'http:', 'https:', 'data:', 'blob:'],
        'object-src': ["'none'"],
        'script-src': ["'self'", 'blob:'],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'media-src': ['*', 'data:', 'blob:'],
        'upgrade-insecure-requests': [],
    };
}
