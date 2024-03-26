import { getSequenceDuration } from './get-sequence-duration';
import type { Question } from 'types/models/question.type';

export type Sound = {
    soundUrl: string;
    volume: number;
    beginTime: number;
    deltaBeginTime: number;
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
            const defaultSoundParams = {
                soundUrl: question.soundUrl,
                volume: question.soundVolume || 100,
            };

            const soundBeginTime = question.voiceOffBeginTime;
            if (soundBeginTime < 0) {
                sounds.push({
                    ...defaultSoundParams,
                    beginTime: time,
                    maxDuration: Math.max(0, questionDuration),
                    deltaBeginTime: Math.abs(soundBeginTime),
                });
            } else {
                sounds.push({
                    ...defaultSoundParams,
                    beginTime: time + soundBeginTime,
                    maxDuration: Math.max(0, questionDuration - soundBeginTime),
                    deltaBeginTime: 0,
                });
            }
        }
        time += questionDuration;
    }
    return sounds;
}
