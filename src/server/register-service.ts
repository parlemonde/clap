/**
 * Register service: Stores instances in `global` to prevent memory leaks.
 * Should be used by server functions only.
 */
export const registerService = <T>(name: string, initFn: () => T): T => {
    if (!(name in globalThis)) {
        (globalThis as Record<string, unknown>)[name] = initFn();
    }
    return (globalThis as Record<string, unknown>)[name] as T;
};
