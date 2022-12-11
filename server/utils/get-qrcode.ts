import QRCode from 'qrcode';

import { logger } from '../lib/logger';

export async function getQRCodeURL(url: string): Promise<string> {
    try {
        return await QRCode.toDataURL(url);
    } catch (err) {
        logger.error('Could not generate QRCode url...');
        logger.error(err);
        return '';
    }
}
