/**
 * Checks whether or not a password is strong enough.
 * The password must contains at least 8 characters with lowercase, capitalcase letters and numbers.
 *
 * @param password - password to check
 * @returns whether or not the password is strong.
 */
export function isPasswordValid(password: string): boolean {
    return password.length >= 8 && /\d+/.test(password) && /[a-z]+/.test(password) && /[A-Z]+/.test(password);
}
