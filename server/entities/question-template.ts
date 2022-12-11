import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import type { QuestionTemplate as QuestionTemplateInterface } from '../../types/models/question.type';
import { Scenario } from './scenario';

@Entity()
export class QuestionTemplate implements QuestionTemplateInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 280 })
    public question: string;

    @Column({ default: 0 })
    public index: number;

    @Column({ type: 'varchar', length: 2 })
    public languageCode: string;

    @ManyToOne(() => Scenario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scenarioId' })
    public scenario?: Scenario;

    @Column({ nullable: false })
    public scenarioId: number;
}
