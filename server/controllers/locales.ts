import { getRepository } from 'typeorm';

import { Language } from '../entities/language';
import { UserType } from '../entities/user';
import { uploadFile } from '../fileUpload';
import { fileToTranslations, translationsToFile } from '../translations';
import { getLocales } from '../translations/getLocales';
import { Controller } from './controller';

const LOCALE_REGEX = /^\w\w(\.(po|json))?$/;

const localesController = new Controller('/locales');

localesController.get({ path: '/:value' }, async (req, res, next) => {
    const value = req.params.value || '';
    if (!LOCALE_REGEX.test(value)) {
        next();
        return;
    }
    const values = value.split('.');
    const language = values[0];
    const extension = values.length > 1 ? values[1] : 'json';
    if (extension === 'po') {
        const filePath = await translationsToFile(language);
        res.sendFile(filePath);
        return;
    }
    const locales = await getLocales(language);
    res.sendJSON(locales);
});

localesController.upload({ path: '/:value', userType: UserType.ADMIN, multerFieldName: 'file' }, async (req, res, next) => {
    if (!req.user || !req.file) {
        next();
        return;
    }
    const value = req.params.value || '';
    const language = await getRepository(Language).findOne({ where: { value } });
    if (language === undefined) {
        next();
        return;
    }

    const newTranslations = await fileToTranslations(req.file.buffer);
    const url = await uploadFile('locales', `${language.value}.json`, Buffer.from(JSON.stringify(newTranslations), 'utf-8'));
    res.sendJSON({ url });
});

export { localesController };
