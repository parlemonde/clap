import { getFile } from '../fileUpload';
import { getBufferFromStream } from '../utils/get-buffer-from-stream';
import { locales as defaultLocales } from './defaultLocales';

export const getLocales = async (language: string): Promise<{ [key: string]: string }> => {
    const JSONlanguageBuffer = await getFile(`locales/${language}.json`).then(getBufferFromStream);
    const locales = JSONlanguageBuffer !== null ? JSON.parse(JSONlanguageBuffer.toString()) : {};

    return {
        ...defaultLocales,
        ...locales,
    };
};
