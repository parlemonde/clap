export function setCookie(
    name: string,
    value: string,
    options: {
        path?: string;
        secure?: boolean;
        'max-age'?: number;
        expires?: Date | string;
    } = {},
): void {
    options = {
        path: '/',
        ...options,
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

    for (const optionKey in options) {
        updatedCookie += '; ' + optionKey;
        const optionValue = options[optionKey as 'path' | 'secure' | 'max-age' | 'expires'];
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue;
        }
    }

    document.cookie = updatedCookie;
}
