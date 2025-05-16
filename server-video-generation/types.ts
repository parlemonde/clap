export const isObjectLiteral = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
export const isString = (value: unknown): value is string => typeof value === 'string';
export interface File {
    name: string;
    path: string;
}
export const isFile = (value: unknown): value is File => isObjectLiteral(value) && isString(value.name) && isString(value.path);
