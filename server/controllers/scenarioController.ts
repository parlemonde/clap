import type { Request, Response, NextFunction } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';

import { ScenarioRepository } from '../customRepositories/scenarioRepository';
import { Scenario } from '../entities/scenario';
import { Theme } from '../entities/theme';
import { User, UserType } from '../entities/user';
import { Controller, get, post, put, del } from './controller';

function getIDs(reqID: string | undefined | null): { id: number; languageCode: string | null } {
    const scenarioIDS: string[] = (reqID || '_').split('_');
    return {
        id: parseInt(scenarioIDS[0], 10) || 0,
        languageCode: scenarioIDS.length > 1 ? scenarioIDS[1].slice(0, 2) : null,
    };
}

export class ScenariosController extends Controller {
    constructor() {
        super('scenarios');
    }

    @get()
    public async getScenarios(req: Request, res: Response): Promise<void> {
        const { query } = req;
        // USER ONLY
        if (query.getQuestionsCount && query.themeId !== undefined) {
            const p: { themeId: number; languageCode?: string; isDefault?: boolean; userId?: number } = {
                themeId: parseInt(query.themeId as string) || 0,
            };
            if (query.languageCode !== undefined) {
                p.languageCode = query.languageCode as string;
            }
            if (query.isDefault !== undefined) {
                p.isDefault = query.isDefault === 'true';
            }
            if ((query.user !== undefined || query.userId !== undefined) && req.user !== undefined) {
                p.userId = req.user.id;
            }
            const s: Scenario[] = await getCustomRepository(ScenarioRepository).findWithQuestionsCount(p);
            res.sendJSON(s);
            return;
        }

        // ADMIN QUERY
        const archivedThemeIDs: number[] = (await getRepository(Theme).find({ isArchived: true })).map((theme: Theme) => theme.id);
        const params: Array<{ isDefault?: boolean; user?: { id: number }; languageCode?: string; theme?: { id: number } }> = [];
        if (query.isDefault !== undefined) {
            params.push({ isDefault: query.isDefault === 'true' || query.isDefault === '' });
        }
        if ((query.userId !== undefined || query.user !== undefined) && req.user !== undefined) {
            params.push({ user: { id: req.user.id } });
        }

        if (query.languageCode !== undefined) {
            if (params.length === 0) {
                params.push({ languageCode: query.languageCode as string });
            } else {
                for (let i = 0, n = params.length; i < n; i++) {
                    params[i].languageCode = query.languageCode as string;
                }
            }
        }
        if (query.themeId !== undefined) {
            if (params.length === 0) {
                params.push({ theme: { id: parseInt(query.themeId as string) || 0 } });
            } else {
                for (let i = 0, n = params.length; i < n; i++) {
                    params[i].theme = { id: parseInt(query.themeId as string) || 0 };
                }
            }
        }

        let scenarios = await getRepository(Scenario).find({ where: params });
        scenarios = scenarios.filter((s) => !archivedThemeIDs.includes(s.themeId));
        res.sendJSON(scenarios);
    }

    @get({ path: '/:id' })
    public async getScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id, languageCode } = getIDs(req.params.id);
        if (languageCode !== null) {
            const scenario = await getRepository(Scenario).findOne({ where: { id, languageCode: languageCode || 'fr' } });
            if (scenario === undefined) {
                next();
                return;
            }
            res.sendJSON(scenario);
        } else {
            const scenarios = await getRepository(Scenario).find({ where: { id } });
            if (scenarios.length === 0) {
                next();
                return;
            }
            res.sendJSON(scenarios);
        }
    }

    @post({ userType: UserType.CLASS })
    public async addScenario(req: Request, res: Response): Promise<void> {
        const scenario: Scenario = new Scenario(); // create a new scenario
        scenario.description = req.body.description || '';
        scenario.languageCode = req.body.languageCode || 'fr';
        scenario.name = req.body.name || '';
        scenario.isDefault = req.body.isDefault || false;
        const scenarioId = parseInt(req.body.id, 10);
        if (!isNaN(scenarioId) && scenarioId !== 0) {
            scenario.id = scenarioId;
        }

        if (req.body.userId !== undefined && req.user) {
            scenario.user = new User();
            scenario.user.id = req.user.id;
        }
        if (req.body.themeId !== undefined) {
            scenario.theme = new Theme();
            scenario.theme.id = req.body.themeId;
        }

        await getCustomRepository(ScenarioRepository).saveScenario(scenario);
        res.sendJSON(scenario);
    }

    @put({ path: '/:id', userType: UserType.PLMO_ADMIN })
    public async updateScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id, languageCode } = getIDs(req.params.id);
        const scenario = await getRepository(Scenario).findOne({ where: { id, languageCode: languageCode || 'fr' } });
        if (scenario === undefined) {
            next();
            return;
        }

        if (req.body.description !== undefined) {
            scenario.description = req.body.description || '';
        }
        if (req.body.name !== undefined) {
            scenario.name = req.body.name || '';
        }
        if (req.body.isDefault !== undefined) {
            scenario.isDefault = req.body.isDefault || false;
        }

        await getRepository(Scenario).save(scenario);
        res.sendJSON(scenario);
    }

    @del({ path: '/:id', userType: UserType.CLASS })
    public async deleteScenario(req: Request, res: Response): Promise<void> {
        const { id, languageCode } = getIDs(req.params.id);
        if (languageCode === null) {
            await getRepository(Scenario).delete({ id });
        } else {
            await getRepository(Scenario).delete({ id, languageCode: languageCode || 'fr' });
        }
        res.status(204).send();
    }
}
