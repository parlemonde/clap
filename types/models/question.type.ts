import type { Plan } from './plan.type';

export interface Question {
    id: number;
    question: string;
    isDefault: boolean;
    scenarioId: number | string;
    languageCode: string;
    index: number;
    plans?: Plan[] | null;
    planStartIndex?: number;
}
