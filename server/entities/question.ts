import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, getRepository, OneToOne, JoinColumn } from 'typeorm';

import type { Question as QuestionInterface } from '../../types/models/question.type';
import { Plan } from './plan';
import { Project } from './project';
import { Sound } from './sound';
import { Title } from './title';

@Entity()
export class Question implements QuestionInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 280 })
    public question: string;

    @Column({ default: false })
    public isDefault: boolean;

    @Column()
    public scenarioId: number;

    @Column({ type: 'varchar', length: 2 })
    public languageCode: string;

    @Column({ default: 0 })
    public index: number;

    @OneToMany(() => Plan, (plan) => plan.question)
    public plans: Plan[];

    @ManyToOne(() => Project, (project) => project.questions, { onDelete: 'CASCADE' })
    public project: Project;

    public async getPlans(): Promise<Question> {
        this.plans = await getRepository(Plan).find({ where: { question: { id: this.id } }, order: { index: 'ASC' }, relations: ['image'] });
        for (const plan of this.plans) {
            plan.url = plan.image ? plan.image.path : null;
        }
        return this;
    }

    @Column({ type: 'varchar', length: 280, default: '' })
    public voiceOff: string;

    @Column({ default: 0 })
    public voiceOffBeginTime: number;

    @OneToOne(() => Sound, { onDelete: 'SET NULL' })
    @JoinColumn()
    public sound: Sound | null;

    @OneToOne(() => Title, { onDelete: 'SET NULL' })
    @JoinColumn()
    public title: Title;

    @Column({ nullable: true })
    public duration: number;
}
