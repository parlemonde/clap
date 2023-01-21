import { getSequenceDuration } from './get-sequence-duration';
import type { Question } from 'types/models/question.type';

export type Sound = {
    soundUrl: string;
    volume: number;
    beginTime: number;
    maxDuration: number;
};

export function getSounds(questions: Question[]): Sound[] {
    const sounds: Sound[] = [];
    let time = 0;
    for (const question of questions) {
        const questionDuration = getSequenceDuration(question);
        if (questionDuration === 0) {
            continue;
        }
        if (question.soundUrl) {
            sounds.push({
                soundUrl: question.soundUrl,
                volume: question.soundVolume || 100,
                beginTime: time + question.voiceOffBeginTime,
                maxDuration: Math.max(0, questionDuration - question.voiceOffBeginTime),
            });
        }
        time += questionDuration;
    }
    return sounds;
}
