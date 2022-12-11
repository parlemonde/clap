import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import type { Question as QuestionInterface } from '../../types/models/question.type';
import type { Title } from '../../types/models/title.type';
import { Plan } from './plan';
import { Project } from './project';

@Entity()
export class Question implements QuestionInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 280 })
    public question: string;

    @Column({ default: 0 })
    public index: number;

    @ManyToOne(() => Project, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    public project?: Project;

    @Column({ nullable: false })
    public projectId: number;

    @OneToMany(() => Plan, (plan) => plan.question, { cascade: true })
    public plans: Plan[];

    @Column({ type: 'json', nullable: true })
    public title: Title | null;

    @Column({ type: 'text', nullable: true })
    public voiceOff: string | null;

    @Column({ nullable: false, default: 0 })
    public voiceOffBeginTime: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    public soundUrl: string | null;

    @Column({ type: 'integer', nullable: true })
    public soundVolume: number | null;
}
