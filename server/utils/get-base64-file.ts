import fs from 'fs';

export function getBase64File(path: string): string {
    return fs.readFileSync(path).toString('base64');
}
