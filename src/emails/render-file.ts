import type { tFunction } from 'src/i18n/translateFunction';

const optionsRegex = /{{(.+?)}}/gm;

export async function renderFile(data: string, options: { [key: string]: string }, t: tFunction): Promise<string> {
    return data.replace(
        optionsRegex,
        (_match: string, group: string) =>
            `${group.startsWith('translate_') ? t(group.slice(10), options) : options[group] !== undefined ? options[group] : group}`,
    );
}
