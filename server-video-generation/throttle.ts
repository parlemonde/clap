/**
 * Returns a throttled function
 *
 * @param func - The function to throttle.
 * @param threshold - The time to wait between each call.
 * @returns func - the throttled function.
 */
export function throttle<F extends (...args: Parameters<F>) => void>(func: F, threshold: number) {
    let last: number;
    let timeout: NodeJS.Timeout;

    const throttled = (...args: Parameters<F>) => {
        const now = new Date().getTime();
        if (last && now < last + threshold) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), threshold);
        } else {
            last = now;
            func(...args);
        }
    };
    throttled.clear = () => {
        clearTimeout(timeout);
    };

    return throttled;
}
