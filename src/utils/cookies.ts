export function getCookie(cname: string): string {
    const name = cname + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

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
