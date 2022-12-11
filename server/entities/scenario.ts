import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, DeleteDateColumn } from 'typeorm';

import type { Scenario as ScenarioInterface } from '../../types/models/scenario.type';
import { Theme } from './theme';
import { User } from './user';

@Entity()
export class Scenario implements ScenarioInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ default: false })
    public isDefault: boolean;

    @Column({ type: 'json' })
    public names: Record<string, string>;

    @Column({ type: 'json' })
    public descriptions: Record<string, string>;

    @ManyToOne(() => Theme, (theme: Theme) => theme.scenarios, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'themeId' })
    public theme?: Theme;

    @Column({ nullable: false })
    public themeId: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    public user?: User;

    @Column({ nullable: true })
    public userId: number | null;

    @DeleteDateColumn({ select: false })
    public deleteDate?: Date;

    public questionsCount: Record<string, number> = {};
}
