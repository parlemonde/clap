import { Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Invite {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 20 })
    public token: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public expired_at: Date;
}
