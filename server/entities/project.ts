import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

import type { Project as ProjectInterface } from '../../types/models/project.type';
import { Question } from './question';
import { Scenario } from './scenario';
import { Theme } from './theme';
import { User } from './user';

@Entity()
export class Project implements ProjectInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 200, nullable: false })
    public title: string;

    @Column({ type: 'varchar', length: 2 })
    public languageCode: string;

    @CreateDateColumn()
    public createDate: string;

    @UpdateDateColumn()
    public updateDate: string;

    @DeleteDateColumn({ select: false })
    public deleteDate?: Date;

    @Column({ type: 'varchar', length: 200, nullable: true })
    public soundUrl: string | null;

    @Column({ type: 'integer', nullable: true })
    public soundVolume: number | null;

    @Column({ default: 0, nullable: false })
    public musicBeginTime: number;

    // -- theme --
    @ManyToOne(() => Theme, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'themeId' })
    public theme?: Theme;

    @Column({ nullable: false })
    public themeId: number;

    // -- scenario --
    @ManyToOne(() => Scenario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scenarioId' })
    public scenario: Scenario;

    @Column({ nullable: false })
    public scenarioId: number;

    // -- user --
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    public user: User;

    @Column({ nullable: false })
    public userId: number;

    // -- questions --
    @OneToMany(() => Question, (question) => question.project, { cascade: true })
    public questions?: Question[];

    // -- video generation job id --
    @Column({ type: 'varchar', length: 36, select: false })
    public videoJobId: string | null;
}
