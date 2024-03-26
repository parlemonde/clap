import { Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Invite {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 20 })
    public token: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public expiredAt: Date;
}
