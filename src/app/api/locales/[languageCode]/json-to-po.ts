import { Buffer } from 'buffer';

import type { Comments, SingleTranslation, translationObject } from './util';
import { HEADERS, foldLine, compareMsgid, generateHeader } from './util';
import { getLocalesForLanguage } from 'src/actions/get-locales';
import { PO_PLURALS } from 'src/i18n/getPlurals';

const FOLD_LENGTH = 76;

/**
 * Converts a comments object to a comment string.
 */
function drawComments(comments: Comments): string {
    const lines: Array<string> = [];
    const types = [
        {
            key: 'translator',
            prefix: '# ',
        },
        {
            key: 'reference',
            prefix: '#: ',
        },
        {
            key: 'extracted',
            prefix: '#. ',
        },
        {
            key: 'flag',
            prefix: '#, ',
        },
        {
            key: 'previous',
            prefix: '#| ',
        },
    ] as const;

    types.forEach(({ key, prefix }) => {
        if (!comments[key]) {
            return;
        }

        comments[key].split(/\r?\n|\r/).forEach((line: string) => {
            lines.push(`${prefix}${line}`);
        });
    });

    return lines.join('\n');
}

/**
 * Escapes and joins a key and a value for the PO string
 */
function addPOString(key: string = '', value: string = ''): string {
    key = key.toString();

    // escape newlines and quotes
    value = value.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n');

    let lines = [value];

    if (FOLD_LENGTH > 0) {
        lines = foldLine(value, FOLD_LENGTH);
    }

    if (lines.length < 2) {
        return `${key} "${lines.shift() || ''}"`;
    }

    return `${key} ""\n"${lines.join('"\n"')}"`;
}

/**
 * Builds a PO string for a single translation object
 */
function drawBlock(block: SingleTranslation, override: Partial<SingleTranslation> = {}): string {
    const response = [];
    const msgctxt = override.msgctxt || block.msgctxt;
    const msgid = override.msgid || block.msgid;
    const msgidPlural = override.msgid_plural || block.msgid_plural;
    const msgstr = [...(override.msgstr || block.msgstr)];
    const comments = override.comments || block.comments;
    const commentsString = comments ? drawComments(comments) : '';

    // add comments
    if (commentsString) {
        response.push(commentsString);
    }

    if (msgctxt) {
        response.push(addPOString('msgctxt', msgctxt));
    }

    response.push(addPOString('msgid', msgid || ''));

    if (msgidPlural) {
        response.push(addPOString('msgid_plural', msgidPlural));

        msgstr.forEach((msgstr, i) => {
            response.push(addPOString(`msgstr[${i}]`, msgstr || ''));
        });
    } else {
        response.push(addPOString('msgstr', msgstr[0] || ''));
    }

    return response.join('\n');
}

export async function jsonToPo(languageCode: string, locales: Record<string, string>): Promise<Buffer> {
    const translationHeaders: translationObject['headers'] = {
        'Project-Id-Version': 'clap',
        'Report-Msgid-Bugs-To': '',
        'POT-Creation-Date': new Date().toISOString(),
        'PO-Revision-Date': new Date().toISOString(),
        'Language-Team': 'French',
        'Plural-Forms': PO_PLURALS[languageCode] || 'nplurals=2; plural=(n != 1);',
        'MIME-Version': '1.0',
        'Content-Type': 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding': '8bit',
        'X-Loco-Source-Locale': 'fr',
        'X-Generator': '',
        'Last-Translator': '',
        Language: languageCode,
    };
    const translations: translationObject['translations'] = {
        '': {},
    };

    const frenchTranslations = await getLocalesForLanguage('fr');
    for (const key of Object.keys(frenchTranslations)) {
        if (key.endsWith('_plural')) {
            continue;
        }

        const singleTranslation: SingleTranslation = {
            msgid: frenchTranslations[key],
            msgstr: [locales[key] || ''],
            msgctxt: key,
        };
        const pluralKey = `${key}_plural`;
        if (frenchTranslations[pluralKey]) {
            // eslint-disable-next-line camelcase
            singleTranslation.msgid_plural = frenchTranslations[pluralKey];
            singleTranslation.msgstr.push(locales[pluralKey] || '');
        }
        translations[key] = {};
        translations[key][singleTranslation.msgid] = singleTranslation;
    }

    const headers = Object.keys(translationHeaders).reduce<Record<string, string>>((result, key) => {
        const lowerKey = key.toLowerCase();
        if (HEADERS.has(lowerKey)) {
            result[HEADERS.get(lowerKey) as string] = translationHeaders[key];
        } else {
            result[key] = translationHeaders[key];
        }
        return result;
    }, {});

    const headerBlock = (translations[''] && translations['']['']) || {};
    const response: Array<SingleTranslation> = [];

    Object.keys(translations).forEach((msgctxt) => {
        if (typeof translations[msgctxt] !== 'object') {
            return;
        }

        Object.keys(translations[msgctxt]).forEach((msgid) => {
            if (typeof translations[msgctxt][msgid] !== 'object') {
                return;
            }

            if (msgctxt === '' && msgid === '') {
                return;
            }

            response.push(translations[msgctxt][msgid]);
        });
    });

    return Buffer.from(
        [
            drawBlock(headerBlock, {
                msgstr: [generateHeader(headers)],
            }),
            ...response.sort(compareMsgid).map((r) => drawBlock(r)),
        ].join('\n\n'),
        'utf-8',
    );
}
