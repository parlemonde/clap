import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { User as UserInterface } from '../../types/models/user.type';
import { UserType } from '../../types/models/user.type';

export { UserType };

@Entity()
export class User implements UserInterface {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 150, unique: true })
    public email: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    public pseudo: string;

    @Column({ type: 'varchar', length: 2 })
    public languageCode: string;

    @Column({ type: 'varchar', length: 200, default: '' })
    public school: string;

    @Column({ default: 0 })
    public accountRegistration: number; // 0 to 3 -> Ok, 4 -> Account blocked, 10 -> Account use PLM SSO

    @Column({ type: 'varchar', length: 180, select: false })
    public passwordHash?: string;

    @Column({ type: 'varchar', length: 180, default: '', select: false })
    public verificationHash?: string;

    @Column({
        type: 'enum',
        enum: UserType,
        default: 0,
    })
    type: UserType;
}
