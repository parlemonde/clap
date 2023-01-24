/**
 * Returns a random token. Browser only!
 * @param length length of the returned token.
 */
export function generateTemporaryToken(length: number = 40): string {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const cryptoObj = !process.browser
        ? null
        : window.crypto || 'msCrypto' in window
        ? (window as Window & typeof globalThis & { msCrypto: Crypto }).msCrypto
        : null; // for IE 11
    if (!cryptoObj) {
        return Array(length)
            .fill(validChars)
            .map(function (x) {
                return x[Math.floor(Math.random() * x.length)];
            })
            .join('');
    }
    let array = new Uint8Array(length);
    cryptoObj.getRandomValues(array);
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    const randomState = String.fromCharCode.apply(null, [...array]);
    return randomState;
}
