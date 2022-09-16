import type { Question } from "./question.type";

export interface Title {
  id: number | string;
  posX: number;
  posY: number;
  text: string;
  fontFamily: string;
  question: Question | null;
  duration: number;
}
