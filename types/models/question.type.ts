import type { Plan } from './plan.type';
import type { Sound } from './sound.type';
import type { Title } from './title.type';

export interface Question {
    id: number;
    question: string;
    isDefault: boolean;
    scenarioId: number | string;
    languageCode: string;
    index: number;
    plans?: Plan[] | null;
    title?: Title | null;
    planStartIndex?: number;
    voiceOff: string | null;
    voiceOffBeginTime: number | null;
    sound: Sound | null;
    duration: number;
}
