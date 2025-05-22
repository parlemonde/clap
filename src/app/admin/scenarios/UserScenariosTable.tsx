'use client';

import * as React from 'react';

import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import type { Scenario } from 'src/database/schemas/scenarios';
import type { Theme } from 'src/database/schemas/themes';

type ScenarioData = {
    themeIndex: number;
    startIndex: number;
    scenarios: Scenario[];
};

type ScenariosTableProps = {
    themes: Theme[];
    scenarios: Scenario[];
};

export const UserScenariosTable = ({ themes, scenarios }: ScenariosTableProps) => {
    const scenariosData: ScenarioData[] = [];
    let currentStartIndex = 0;
    for (let themeIndex = 0; themeIndex < themes.length; themeIndex++) {
        const themeScenarios = scenarios.filter((s) => s.themeId === themes[themeIndex].id);
        if (themeScenarios.length > 0) {
            scenariosData.push({
                themeIndex: themeIndex,
                startIndex: currentStartIndex,
                scenarios: themeScenarios,
            });
            currentStartIndex += themeScenarios.length;
        }
    }
    const themeIdsSet = new Set(themes.map((t) => t.id));
    const additionalScenarios = scenarios.filter((s) => !themeIdsSet.has(s.themeId));
    if (additionalScenarios.length > 0) {
        scenariosData.push({
            themeIndex: -1,
            startIndex: currentStartIndex,
            scenarios: additionalScenarios,
        });
    }

    return (
        <AdminTile marginTop={32} marginBottom="md" title="Scénarios des utilisateurs">
            <Table aria-label="tout les scénarios">
                <thead style={{ borderBottom: 'none' }}>
                    <tr>
                        <th align="left">#</th>
                        <th align="left">Nom</th>
                        <th align="left">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {scenariosData.map((data) => (
                        <React.Fragment key={`top_${data.themeIndex}`}>
                            <tr style={{ backgroundColor: 'rgb(84, 136, 115)', color: 'white' }}>
                                <th
                                    colSpan={4}
                                    style={{
                                        padding: '4px 16px',
                                        border: 'none',
                                    }}
                                >
                                    Thème : {data.themeIndex === -1 ? 'Autres thèmes (créés par les utilisateurs)' : themes[data.themeIndex].names.fr}
                                </th>
                            </tr>
                            {data.scenarios.map((s, index) => (
                                <tr style={{ backgroundColor: index % 2 === 0 ? 'white' : 'rgb(224 239 232)' }} key={`${data.themeIndex}_${s.id}`}>
                                    <th style={{ width: '3rem', padding: '8px 16px' }}>{index + data.startIndex + 1}</th>
                                    <th style={{ padding: '8px 16px' }}>{Object.values(s.names)[0]}</th>
                                    <th style={{ padding: '8px 16px' }}>{Object.values(s.descriptions)[0]}</th>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
        </AdminTile>
    );
};
