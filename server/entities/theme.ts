import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';

import type { Theme as ThemeInterface } from '../../types/models/theme.type';
import { Scenario } from './scenario';
import { User } from './user';

@Entity()
export class Theme implements ThemeInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ default: 0 })
    public order: number;

    @Column({ default: false })
    public isDefault: boolean;

    @Column({ type: 'varchar', length: 4000, nullable: true, default: null })
    public imageUrl: string | null;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    public user?: User;

    @Column({ nullable: true })
    public userId: number | null;

    @Column({ type: 'json' })
    public names: Record<string, string>;

    @OneToMany(() => Scenario, (scenario: Scenario) => scenario.theme)
    public scenarios?: Scenario[];

    @DeleteDateColumn({ select: false })
    public deleteDate?: Date;
}
