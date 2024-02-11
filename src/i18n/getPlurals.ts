/* eslint-disable */
const sets = [
  { lngs: ["ach", "ak", "am", "arn", "br", "fil", "gun", "ln", "mfe", "mg", "mi", "oc", "pt", "pt-BR", "tg", "ti", "tr", "uz", "wa"], nr: [1, 2], fc: 1 },
  // prettier-ignore
  { lngs: [ // prettier-ignore
      "af", "an", "ast", "az", "bg", "bn", "ca", "da", "de", "dev", "el", "en", "eo", "es", "et", "eu", // prettier-ignore
      "fi", "fo", "fur", "fy", "gl", "gu", "ha", "hi", "hu", "hy", "ia", "it", "kn", "ku", "lb", "mai", // prettier-ignore
      "ml", "mn", "mr", "nah", "nap", "nb", "ne", "nl", "nn", "no", "nso", "pa", "pap", "pms", "ps", "pt-PT", // prettier-ignore
      "rm", "sco", "se", "si", "so", "son", "sq", "sv", "sw", "ta", "te", "tk", "ur", "yo", // prettier-ignore
    ], nr: [1, 2], fc: 2 },
  { lngs: ["ay", "bo", "cgg", "fa", "ht", "id", "ja", "jbo", "ka", "kk", "km", "ko", "ky", "lo", "ms", "sah", "su", "th", "tt", "ug", "vi", "wo", "zh"], nr: [1], fc: 3 },
  { lngs: ["be", "bs", "cnr", "dz", "hr", "ru", "sr", "uk"], nr: [1, 2, 5], fc: 4 },
  { lngs: ["ar"], nr: [0, 1, 2, 3, 11, 100], fc: 5 },
  { lngs: ["cs", "sk"], nr: [1, 2, 5], fc: 6 },
  { lngs: ["csb", "pl"], nr: [1, 2, 5], fc: 7 },
  { lngs: ["cy"], nr: [1, 2, 3, 8], fc: 8 },
  { lngs: ["fr"], nr: [1, 2], fc: 9 },
  { lngs: ["ga"], nr: [1, 2, 3, 7, 11], fc: 10 },
  { lngs: ["gd"], nr: [1, 2, 3, 20], fc: 11 },
  { lngs: ["is"], nr: [1, 2], fc: 12 },
  { lngs: ["jv"], nr: [0, 1], fc: 13 },
  { lngs: ["kw"], nr: [1, 2, 3, 4], fc: 14 },
  { lngs: ["lt"], nr: [1, 2, 10], fc: 15 },
  { lngs: ["lv"], nr: [1, 2, 0], fc: 16 },
  { lngs: ["mk"], nr: [1, 2], fc: 17 },
  { lngs: ["mnk"], nr: [0, 1, 2], fc: 18 },
  { lngs: ["mt"], nr: [1, 2, 11, 20], fc: 19 },
  { lngs: ["or"], nr: [2, 1], fc: 2 },
  { lngs: ["ro"], nr: [1, 2, 20], fc: 20 },
  { lngs: ["sl"], nr: [5, 1, 2, 3], fc: 21 },
  { lngs: ["he", "iw"], nr: [1, 2, 20, 21], fc: 22 },
];

let _rulesPluralsTypes: { [key: number]: (n: number) => number } = {
  1: (n: number) => Number(n > 1),
  2: (n: number) => Number(n != 1),
  3: (_n: number) => 0,
  4: (n: number) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  5: (n: number) => Number(n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5),
  6: (n: number) => Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2),
  7: (n: number) => Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  8: (n: number) => Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3),
  9: (n: number) => Number(n >= 2),
  10: (n: number) => Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4),
  11: (n: number) => Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3),
  12: (n: number) => Number(n % 10 != 1 || n % 100 == 11),
  13: (n: number) => Number(n !== 0),
  14: (n: number) => Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3),
  15: (n: number) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2),
  16: (n: number) => Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2),
  17: (n: number) => Number(n == 1 || (n % 10 == 1 && n % 100 != 11) ? 0 : 1),
  18: (n: number) => Number(n == 0 ? 0 : n == 1 ? 1 : 2),
  19: (n: number) => Number(n == 1 ? 0 : n == 0 || (n % 100 > 1 && n % 100 < 11) ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3),
  20: (n: number) => Number(n == 1 ? 0 : n == 0 || (n % 100 > 0 && n % 100 < 20) ? 1 : 2),
  21: (n: number) => Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0),
  22: (n: number) => Number(n == 1 ? 0 : n == 2 ? 1 : (n < 0 || n > 10) && n % 10 == 0 ? 2 : 3),
};

/* eslint-enable */
interface RuleWithoutPlural {
    fc: number;
    numbers: number[];
}
interface Rule extends RuleWithoutPlural {
    plurals: (n: number) => number;
}
type pluralRules = { [language: string]: RuleWithoutPlural };
function getRules(): pluralRules {
    const rules: pluralRules = {};
    sets.forEach((set) => {
        set.lngs.forEach((l) => {
            rules[l] = {
                fc: set.fc,
                numbers: set.nr,
            };
        });
    });
    return rules;
}

const RULES = getRules();

export function getRule(language: string): Rule | null {
    if (RULES[language] === undefined) {
        return null;
    }

    const rule = RULES[language];
    if (rule === undefined) {
        return null;
    }
    return {
        ...rule,
        plurals: _rulesPluralsTypes[rule.fc] || (() => 0),
    };
}

export function getPluralSuffix(language: string, count: number): string {
    const rule = getRule(language);
    if (rule === null) {
        console.warn(`No rules found for language ${language}!`);
        return '';
    }

    const index = rule.plurals(Math.abs(count));
    const suffixNumber = rule.numbers[index];
    let suffix: string = `_${rule.numbers[index]}`;

    // special treatment for languages only having singular and plural
    if (rule.numbers.length === 2 && rule.numbers[0] === 1) {
        if (suffixNumber === 2) {
            suffix = '_plural';
        } else if (suffixNumber === 1) {
            suffix = '';
        }
    }

    return suffix;
}
