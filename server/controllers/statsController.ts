import type { Request, Response } from 'express';
import { getRepository } from 'typeorm';

import { PDFDownload } from '../entities/pdfDownload';
import { Project } from '../entities/project';
import { User } from '../entities/user';
import { Controller, get } from './controller';

export class StatsController extends Controller {
    constructor() {
        super('statistics');
    }

    @get()
    public async getAllStats(_req: Request, res: Response): Promise<void> {
        const userCount = await getRepository(User).count();
        const classCount = (await getRepository(User).createQueryBuilder().select('COUNT(DISTINCT(school))', 'count').getRawOne()).count;
        const projectCount = await getRepository(Project).count();
        const pdfCount = await getRepository(PDFDownload).count();

        res.sendJSON({
            userCount,
            classCount,
            projectCount,
            pdfCount,
        });
    }

    @get({ path: '/levels' })
    public async getLevelRepartition(_req: Request, res: Response): Promise<void> {
        const levelRepartition = await getRepository(User)
            .createQueryBuilder()
            .select('level', 'label')
            .addSelect('COUNT(*)', 'count')
            .groupBy('level')
            .getRawMany();
        res.sendJSON(levelRepartition);
    }

    @get({ path: '/projects' })
    public async getProjectsRepartition(_req: Request, res: Response): Promise<void> {
        const projects = await getRepository(Project).find({ take: 400, order: { date: 'DESC' } });
        if (projects.length === 0) {
            res.sendJSON([]);
            return;
        }
        const projectRepartition: Array<{ count: number; day: string; date: Date }> = [
            {
                count: 1,
                day: projects[0].date.toDateString(),
                date: new Date(projects[0].date.toDateString()),
            },
        ];
        for (let i = 1, n = projects.length; i < n; i++) {
            const index = projectRepartition.length - 1;
            if (projectRepartition[index].day === projects[i].date.toDateString()) {
                projectRepartition[index].count += 1;
            } else {
                projectRepartition.push({
                    count: 1,
                    day: projects[i].date.toDateString(),
                    date: new Date(projects[i].date.toDateString()),
                });
            }
        }
        res.sendJSON(projectRepartition);
    }

    @get({ path: '/pdf' })
    public async getPdfRepartition(_req: Request, res: Response): Promise<void> {
        const pdf = await getRepository(PDFDownload).find({ take: 400, order: { date: 'DESC' } });
        if (pdf.length === 0) {
            res.sendJSON([]);
            return;
        }
        const pdfRepartition: Array<{ count: number; day: string; date: Date }> = [
            {
                count: 1,
                day: pdf[0].date.toDateString(),
                date: new Date(pdf[0].date.toDateString()),
            },
        ];
        for (let i = 1, n = pdf.length; i < n; i++) {
            const index = pdfRepartition.length - 1;
            if (pdfRepartition[index].day === pdf[i].date.toDateString()) {
                pdfRepartition[index].count += 1;
            } else {
                pdfRepartition.push({
                    count: 1,
                    day: pdf[i].date.toDateString(),
                    date: new Date(pdf[i].date.toDateString()),
                });
            }
        }
        res.sendJSON(pdfRepartition);
    }
}
