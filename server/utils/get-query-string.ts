export function getQueryString(q: unknown | unknown[] | undefined): string | undefined {
    if (Array.isArray(q) && q.length > 0 && typeof q[0] === 'string') {
        return q[0];
    }
    if (typeof q === 'string') {
        return q;
    }
    return undefined;
}
