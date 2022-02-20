import type { SelectQueryBuilder } from 'typeorm';
import { EntityRepository, getRepository, Repository } from 'typeorm';

import { Question } from '../entities/question';
import { Scenario } from '../entities/scenario';
import { Theme } from '../entities/theme';

@EntityRepository(Scenario)
export class ScenarioRepository extends Repository<Scenario> {
    public async saveScenario(scenario: Scenario): Promise<Scenario> {
        // Ensure theme is not null
        if (!scenario.theme) {
            throw new Error('Error, theme not found.');
        }
        const themeExists: boolean = (await getRepository(Theme).count({ where: { id: scenario.theme.id } })) > 0;
        if (!themeExists) {
            throw new Error('Error, theme not found.');
        }

        if (scenario.id === undefined || scenario.id === null) {
            scenario.id = await this.getNextID();
        }
        return await this.manager.save(scenario);
    }

    public async getNextID(): Promise<number> {
        let sequenceResult: Array<{ id: string }> = [];
        await this.manager.transaction(async (entityManager) => {
            await entityManager.query('UPDATE sequence SET id=LAST_INSERT_ID(id+1)');
            sequenceResult = await entityManager.query('SELECT LAST_INSERT_ID() as id');
        });
        return parseInt(sequenceResult[0].id, 10);
    }

    public async findWithQuestionsCount(params: {
        themeId: number;
        languageCode?: string;
        isDefault?: boolean;
        userId?: number;
    }): Promise<Array<Scenario>> {
        let query: SelectQueryBuilder<Scenario> = this.manager
            .createQueryBuilder()
            .select('scenario')
            .addSelect('count(question.id)', 'questionsCount')
            .from(Scenario, 'scenario')
            .leftJoin(
                Question,
                'question',
                'scenario.id = question.scenarioId and scenario.languageCode = question.languageCode and question.isDefault = true',
            );

        const themequery = '`scenario`.`themeId`';
        const userquery = '`scenario`.`userId`';

        if (params.isDefault !== undefined && params.languageCode !== undefined) {
            query = query.where(`${themequery} = :themeId AND scenario.isDefault = :isDefault AND scenario.languageCode = :languageCode`, params);
            if (params.userId !== undefined) {
                query = query.orWhere(`${themequery} = :themeId AND ${userquery} = :userId`, params);
            }
        } else if (params.isDefault !== undefined) {
            query = query.where(`${themequery} = :themeId AND scenario.isDefault = :isDefault`, params);
            if (params.userId !== undefined) {
                query = query.orWhere(`${themequery} = :themeId AND ${userquery} = :userId`, params);
            }
        } else if (params.languageCode !== undefined) {
            query = query.where(`${themequery} = :themeId AND scenario.languageCode = :languageCode`, params);
            if (params.userId !== undefined) {
                query = query.orWhere(`${themequery} = :themeId AND ${userquery} = :userId`, params);
            }
        } else if (params.userId !== undefined) {
            query = query.where(`${themequery} = :themeId AND ${userquery} = :userId`, params);
        } else {
            query = query.where(`${themequery} = :themeId`, params);
        }

        // eslint-disable-next-line
    const results: any[] = await query.groupBy("scenario.id").addGroupBy("scenario.languageCode").getRawMany();

        const scenarios: Scenario[] = [];
        for (const result of results) {
            const scenario = new Scenario();
            scenario.id = result.scenario_id;
            scenario.languageCode = result.scenario_languageCode;
            scenario.name = result.scenario_name;
            scenario.isDefault = result.scenario_isDefault === 1;
            scenario.description = result.scenario_description;
            scenario.questionsCount = result.questionsCount;
            scenarios.push(scenario);
        }

        return scenarios;
    }
}
