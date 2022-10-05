import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';

import { Question } from './question';
import { Scenario } from './scenario';
import { Sound } from './sound';
import { Theme } from './theme';
import { User } from './user';

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 200, nullable: true })
    public title: string;

    @Column({ nullable: true, default: 0 })
    public musicBeginTime: number;

    @CreateDateColumn()
    public date: Date;

    @ManyToOne(() => Theme)
    public theme: Theme;

    @ManyToOne(() => Scenario)
    public scenario: Scenario;

    @ManyToOne(() => User)
    public user: User;

    @OneToMany(() => Question, (question) => question.project)
    public questions: Question[];

    @OneToOne(() => Sound, { onDelete: 'SET NULL' })
    @JoinColumn()
    public sound: Sound | null;
}
