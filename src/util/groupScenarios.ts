import type { Scenario } from 'types/models/scenario.type';

export interface GroupedScenario {
    id: number;
    themeId: number;
    names: { [key: string]: string };
    descriptions: { [key: string]: string };
    isDefault: boolean;
}

export const groupScenarios = (scenarios: Scenario[]): GroupedScenario[] => {
    const data = scenarios.reduce((d: { [key: number]: GroupedScenario }, s: Scenario) => {
        const sid = parseInt(s.id as string, 10);
        if (d[sid]) {
            d[sid].names[s.languageCode] = s.name;
            d[sid].descriptions[s.languageCode] = s.description;
            if (s.languageCode === 'fr') {
                d[sid].names.default = s.name;
                d[sid].descriptions.default = s.description;
            }
        } else {
            d[sid] = {
                id: sid,
                names: {
                    default: s.name,
                    [s.languageCode]: s.name,
                },
                descriptions: {
                    default: s.description,
                    [s.languageCode]: s.description,
                },
                themeId: parseInt(s.themeId as string, 10),
                isDefault: true,
            };
        }
        return d;
    }, {});
    return Object.keys(data).map((sid) => data[parseInt(sid, 10)]);
};
