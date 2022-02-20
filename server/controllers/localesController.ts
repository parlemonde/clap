import type { Request, Response } from 'express';

import { translationsToFile } from '../translations';
import { getLocales } from '../translations/getLocales';
import { Controller, get } from './controller';

export class LocalesController extends Controller {
    constructor() {
        super('locales');
    }

    @get({ path: '/:value' })
    public async getJSONLanguage(req: Request, res: Response /*, next: NextFunction*/): Promise<void> {
        const value: string = req.params.value || '';
        if (value.endsWith('.po')) {
            const filePath = await translationsToFile(value);
            res.sendFile(filePath);
            return;
        }
        const locales = await getLocales(value.slice(0, 2));
        res.sendJSON(locales);
    }
}
