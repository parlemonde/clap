import { Column, Entity, PrimaryColumn } from 'typeorm';

import type { Language as LanguageInterface } from '../../types/models/language.type';

@Entity()
export class Language implements LanguageInterface {
    @Column({ type: 'varchar', length: 30 })
    public label: string;

    @PrimaryColumn({ type: 'varchar', length: 2 })
    public value: string;
}
