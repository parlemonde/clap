import fs from 'fs-extra';
import * as path from 'path';
import sanitize from 'sanitize-filename';

import { logger } from '../lib/logger';
import { getLocales } from './getLocales';
import { PO_PLURALS } from './getPlurals';
import compile from './json2po';
import { parse } from './po2json';
import type { tFunction } from './translateFunction';
import { getTranslateFunction } from './translateFunction';
import type { translationObject, SingleTranslation } from './util';

export async function getI18n(language: string): Promise<tFunction | null> {
    try {
        const locales = await getLocales(language);
        return getTranslateFunction(language, locales);
    } catch (e) {
        return null;
    }
}

export type LocaleFile = { [key: string]: string };

export async function translationsToFile(language: string): Promise<string> {
    logger.info(`GENERATE PO FILE FOR LANGUAGE: ${language}`);
    const object: translationObject = {
        charset: 'utf-8',
        headers: {
            'Project-Id-Version': 'clap',
            'Report-Msgid-Bugs-To': '',
            'POT-Creation-Date': new Date().toISOString(),
            'PO-Revision-Date': new Date().toISOString(),
            'Language-Team': 'French',
            'Plural-Forms': PO_PLURALS[language] || 'nplurals=2; plural=(n != 1);',
            'MIME-Version': '1.0',
            'Content-Type': 'text/plain; charset=UTF-8',
            'Content-Transfer-Encoding': '8bit',
            'X-Loco-Source-Locale': 'fr',
            'X-Generator': '',
            'Last-Translator': '',
            Language: language,
        },
        translations: {
            '': {},
        },
    };

    const frenchTranslations = await getLocales('fr');
    const translations = await getLocales(language.slice(0, 2));

    for (const key of Object.keys(frenchTranslations)) {
        if (key.endsWith('_plural')) {
            continue;
        }

        const singleTranslation: SingleTranslation = {
            msgid: frenchTranslations[key],
            msgstr: [translations[key] || ''],
            msgctxt: key,
        };
        const pluralKey = `${key}_plural`;
        if (frenchTranslations[pluralKey]) {
            // eslint-disable-next-line
            singleTranslation.msgid_plural = frenchTranslations[pluralKey];
            singleTranslation.msgstr.push(translations[pluralKey] || '');
        }
        object.translations[key] = {};
        object.translations[key][singleTranslation.msgid] = singleTranslation;
    }

    const directory: string = path.join(__dirname, 'poFiles');
    await fs.mkdirs(directory);
    await new Promise((resolve, reject) => {
        fs.writeFile(path.join(directory, `${sanitize(language)}.po`), compile(object), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(undefined);
            }
        });
    });

    return path.join(directory, `${language}.po`);
}

export async function fileToTranslations(filebuffer: Buffer): Promise<LocaleFile> {
    const object: translationObject = parse(filebuffer);
    const translations: LocaleFile = {};
    const newTranslations = object.translations;

    const frenchTranslations = await getLocales('fr');

    for (const key of Object.keys(frenchTranslations)) {
        if (key.endsWith('_plural')) {
            continue;
        }

        if (newTranslations[key] !== undefined && newTranslations[key][frenchTranslations[key]] !== undefined) {
            const data: SingleTranslation = newTranslations[key][frenchTranslations[key]];
            if ((data.msgstr[0] || '').length === 0) {
                continue;
            }

            translations[key] = data.msgstr[0] || '';
            if (data.msgid_plural) {
                translations[`${key}_plural`] = data.msgstr[1] || '';
            }
        }
    }

    return translations;
}
