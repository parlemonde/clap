const sets = [
    // prettier-ignore
    { lngs: ["ach", "ak", "am", "arn", "br", "fil", "gun", "ln", "mfe", "mg", "mi", "oc", "pt", "pt-BR", "tg", "ti", "tr", "uz", "wa"], nr: [1, 2], fc: 1 },
    // prettier-ignore
    { lngs: [ // prettier-ignore
        "af", "an", "ast", "az", "bg", "bn", "ca", "da", "de", "dev", "el", "en", "eo", "es", "et", "eu", // prettier-ignore
        "fi", "fo", "fur", "fy", "gl", "gu", "ha", "hi", "hu", "hy", "ia", "it", "kn", "ku", "lb", "mai", // prettier-ignore
        "ml", "mn", "mr", "nah", "nap", "nb", "ne", "nl", "nn", "no", "nso", "pa", "pap", "pms", "ps", "pt-PT", // prettier-ignore
        "rm", "sco", "se", "si", "so", "son", "sq", "sv", "sw", "ta", "te", "tk", "ur", "yo", // prettier-ignore
      ], nr: [1, 2], fc: 2 },
    // prettier-ignore
    { lngs: ["ay", "bo", "cgg", "fa", "ht", "id", "ja", "jbo", "ka", "kk", "km", "ko", "ky", "lo", "ms", "sah", "su", "th", "tt", "ug", "vi", "wo", "zh"], nr: [1], fc: 3 },
    // prettier-ignore
    { lngs: ["be", "bs", "cnr", "dz", "hr", "ru", "sr", "uk"], nr: [1, 2, 5], fc: 4 },
    { lngs: ['ar'], nr: [0, 1, 2, 3, 11, 100], fc: 5 },
    { lngs: ['cs', 'sk'], nr: [1, 2, 5], fc: 6 },
    { lngs: ['csb', 'pl'], nr: [1, 2, 5], fc: 7 },
    { lngs: ['cy'], nr: [1, 2, 3, 8], fc: 8 },
    { lngs: ['fr'], nr: [1, 2], fc: 9 },
    { lngs: ['ga'], nr: [1, 2, 3, 7, 11], fc: 10 },
    { lngs: ['gd'], nr: [1, 2, 3, 20], fc: 11 },
    { lngs: ['is'], nr: [1, 2], fc: 12 },
    { lngs: ['jv'], nr: [0, 1], fc: 13 },
    { lngs: ['kw'], nr: [1, 2, 3, 4], fc: 14 },
    { lngs: ['lt'], nr: [1, 2, 10], fc: 15 },
    { lngs: ['lv'], nr: [1, 2, 0], fc: 16 },
    { lngs: ['mk'], nr: [1, 2], fc: 17 },
    { lngs: ['mnk'], nr: [0, 1, 2], fc: 18 },
    { lngs: ['mt'], nr: [1, 2, 11, 20], fc: 19 },
    { lngs: ['or'], nr: [2, 1], fc: 2 },
    { lngs: ['ro'], nr: [1, 2, 20], fc: 20 },
    { lngs: ['sl'], nr: [5, 1, 2, 3], fc: 21 },
    { lngs: ['he', 'iw'], nr: [1, 2, 20, 21], fc: 22 },
];

const _rulesPluralsTypes: { [key: number]: (n: number) => number } = {
    1: (n: number) => Number(n > 1),
    2: (n: number) => Number(n != 1),
    3: () => 0,
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

export const PO_PLURALS: Partial<Record<string, string>> = {
    af: 'nplurals=2; plural=(n != 1);',
    ak: 'nplurals=2; plural=(n > 1);',
    am: 'nplurals=2; plural=(n > 1);',
    an: 'nplurals=2; plural=(n != 1);',
    ar: 'nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);',
    as: 'nplurals=2; plural=(n != 1);',
    ay: 'nplurals=1; plural=0;',
    az: 'nplurals=2; plural=(n != 1);',
    be: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    bg: 'nplurals=2; plural=(n != 1);',
    bn: 'nplurals=2; plural=(n != 1);',
    bo: 'nplurals=1; plural=0;',
    br: 'nplurals=2; plural=(n > 1);',
    bs: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    ca: 'nplurals=2; plural=(n != 1);',
    cs: 'nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;',
    cy: 'nplurals=4; plural=(n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3;',
    da: 'nplurals=2; plural=(n != 1);',
    de: 'nplurals=2; plural=(n != 1);',
    dz: 'nplurals=1; plural=0;',
    el: 'nplurals=2; plural=(n != 1);',
    en: 'nplurals=2; plural=(n != 1);',
    eo: 'nplurals=2; plural=(n != 1);',
    es: 'nplurals=2; plural=(n != 1);',
    et: 'nplurals=2; plural=(n != 1);',
    eu: 'nplurals=2; plural=(n != 1);',
    fa: 'nplurals=2; plural=(n > 1);',
    ff: 'nplurals=2; plural=(n != 1);',
    fi: 'nplurals=2; plural=(n != 1);',
    fo: 'nplurals=2; plural=(n != 1);',
    fr: 'nplurals=2; plural=(n > 1);',
    fy: 'nplurals=2; plural=(n != 1);',
    ga: 'nplurals=5; plural=n==1 ? 0 : n==2 ? 1 : (n>2 && n<7) ? 2 :(n>6 && n<11) ? 3 : 4;',
    gd: 'nplurals=4; plural=(n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3;',
    gl: 'nplurals=2; plural=(n != 1);',
    gu: 'nplurals=2; plural=(n != 1);',
    ha: 'nplurals=2; plural=(n != 1);',
    he: 'nplurals=2; plural=(n != 1);',
    hi: 'nplurals=2; plural=(n != 1);',
    hr: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    hu: 'nplurals=2; plural=(n != 1);',
    hy: 'nplurals=2; plural=(n != 1);',
    ia: 'nplurals=2; plural=(n != 1);',
    id: 'nplurals=1; plural=0;',
    is: 'nplurals=2; plural=(n%10!=1 || n%100==11);',
    it: 'nplurals=2; plural=(n != 1);',
    ja: 'nplurals=1; plural=0;',
    jv: 'nplurals=2; plural=(n != 0);',
    ka: 'nplurals=1; plural=0;',
    kk: 'nplurals=2; plural=(n != 1);',
    kl: 'nplurals=2; plural=(n != 1);',
    km: 'nplurals=1; plural=0;',
    kn: 'nplurals=2; plural=(n != 1);',
    ko: 'nplurals=1; plural=0;',
    ku: 'nplurals=2; plural=(n != 1);',
    kw: 'nplurals=4; plural=(n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3;',
    ky: 'nplurals=2; plural=(n != 1);',
    lb: 'nplurals=2; plural=(n != 1);',
    ln: 'nplurals=2; plural=(n > 1);',
    lo: 'nplurals=1; plural=0;',
    lt: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);',
    lv: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2);',
    me: 'nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;',
    mg: 'nplurals=2; plural=(n > 1);',
    mi: 'nplurals=2; plural=(n > 1);',
    mk: 'nplurals=2; plural= n==1 || n%10==1 ? 0 : 1; Can’t be correct needs a 2 somewhere',
    ml: 'nplurals=2; plural=(n != 1);',
    mn: 'nplurals=2; plural=(n != 1);',
    mr: 'nplurals=2; plural=(n != 1);',
    ms: 'nplurals=1; plural=0;',
    mt: 'nplurals=4; plural=(n==1 ? 0 : n==0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3);',
    my: 'nplurals=1; plural=0;',
    nb: 'nplurals=2; plural=(n != 1);',
    ne: 'nplurals=2; plural=(n != 1);',
    nl: 'nplurals=2; plural=(n != 1);',
    nn: 'nplurals=2; plural=(n != 1);',
    no: 'nplurals=2; plural=(n != 1);',
    oc: 'nplurals=2; plural=(n > 1);',
    or: 'nplurals=2; plural=(n != 1);',
    pa: 'nplurals=2; plural=(n != 1);',
    pl: 'nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    ps: 'nplurals=2; plural=(n != 1);',
    pt: 'nplurals=2; plural=(n != 1);',
    rm: 'nplurals=2; plural=(n != 1);',
    ro: 'nplurals=3; plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);',
    ru: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    rw: 'nplurals=2; plural=(n != 1);',
    sd: 'nplurals=2; plural=(n != 1);',
    se: 'nplurals=2; plural=(n != 1);',
    si: 'nplurals=2; plural=(n != 1);',
    sk: 'nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;',
    sl: 'nplurals=4; plural=(n%100==1 ? 0 : n%100==2 ? 1 : n%100==3 || n%100==4 ? 2 : 3);',
    so: 'nplurals=2; plural=(n != 1);',
    sq: 'nplurals=2; plural=(n != 1);',
    sr: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    su: 'nplurals=1; plural=0;',
    sv: 'nplurals=2; plural=(n != 1);',
    sw: 'nplurals=2; plural=(n != 1);',
    ta: 'nplurals=2; plural=(n != 1);',
    te: 'nplurals=2; plural=(n != 1);',
    tg: 'nplurals=2; plural=(n > 1);',
    th: 'nplurals=1; plural=0;',
    ti: 'nplurals=2; plural=(n > 1);',
    tk: 'nplurals=2; plural=(n != 1);',
    tr: 'nplurals=2; plural=(n > 1);',
    tt: 'nplurals=1; plural=0;',
    ug: 'nplurals=1; plural=0;',
    uk: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    ur: 'nplurals=2; plural=(n != 1);',
    uz: 'nplurals=2; plural=(n > 1);',
    vi: 'nplurals=1; plural=0;',
    wa: 'nplurals=2; plural=(n > 1);',
    wo: 'nplurals=1; plural=0;',
    yo: 'nplurals=2; plural=(n != 1);',
    zh: 'nplurals=2; plural=(n > 1);',
};

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

    const rule: RuleWithoutPlural = RULES[language];
    return {
        ...rule,
        plurals: _rulesPluralsTypes[rule.fc],
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
