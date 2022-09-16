import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";

import type { Title as TitleInterface } from "../../types/models/title.type";

import { Question } from "./question";

@Entity()
export class Title implements TitleInterface {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public duration: number;

  @Column()
  public posX: number;

  @Column()
  public posY: number;

  @OneToOne(() => Question, { onDelete: "SET NULL" })
  @JoinColumn()
  public question: Question;

  @Column()
  public text: string;

  @Column()
  public fontFamily: string;
}
