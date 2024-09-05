import type { Plan } from './plan.type';
import type { Title } from './title.type';

export enum QuestionStatus {
    ONGOING = 0,
    STORYBOARD = 1,
    PREMOUNTING = 2,
    SUBMITTED = 3,
    VALIDATED = 4,
}

export interface Question {
    id: number;
    question: string;
    index: number;
    projectId: number;
    plans?: Plan[];
    // --- slideshow attributes ---
    title: Title | null;
    voiceOff: string | null;
    voiceOffBeginTime: number;
    soundUrl: string | null;
    soundVolume: number | null;
    status?: QuestionStatus;
    feedbacks?: string[] | null;
}

export interface QuestionTemplate {
    id: number;
    question: string;
    index: number;
    languageCode: string;
    scenarioId: number;
}
