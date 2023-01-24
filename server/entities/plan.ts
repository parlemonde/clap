import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import type { Plan as PlanInterface } from '../../types/models/plan.type';
import { Question } from './question';

@Entity()
export class Plan implements PlanInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 2000 })
    public description: string;

    @Column()
    public index: number;

    @Column({ type: 'varchar', length: 4000, nullable: true, default: null })
    public imageUrl: string | null;

    @ManyToOne(() => Question, (question) => question.plans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'questionId' })
    public question: Question | null;

    @Column({ nullable: false })
    public questionId: number;

    @Column({ type: 'integer', nullable: true })
    public duration: number | null;
}
