import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';

import type { Theme as ThemeInterface } from '../../types/models/theme.type';
import { Image } from './image';
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

    @Column({ default: false })
    public isArchived: boolean;

    @OneToOne(() => Image, { onDelete: 'SET NULL' })
    @JoinColumn()
    public image: Image;

    @ManyToOne(() => User)
    public user: User | null;

    @Column({ type: 'json' })
    public names: { [key: string]: string };

    @OneToMany(() => Scenario, (scenario: Scenario) => scenario.theme)
    public scenarios: Scenario[];
}
