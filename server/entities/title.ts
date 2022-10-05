import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { Title as TitleInterface } from '../../types/models/title.type';

@Entity()
export class Title implements TitleInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ default: 3000 })
    public duration: number;

    @Column()
    public style: string;

    @Column()
    public text: string;
}
