import type { Question } from './question.type';
import type { Scenario } from './scenario.type';
import type { Theme } from './theme.type';
import type { User } from './user.type';

export interface Project {
    id: number;
    title: string;
    date: Date;
    user: User | null;
    theme: Theme | null;
    scenario: Scenario | null;
    questions: Question[] | null;
}
