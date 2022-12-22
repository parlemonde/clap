/* eslint-disable camelcase */
import { mltToXml } from 'mlt-xml';

import type { Question } from '../entities/question';

type Project = {
    projectTitle: string;
    scenarioName: string;
    soundUrl?: string | null;
};

export function objToXml(questions: Question[], project: Project) {
    const mlt: MLT = {
        title: project.projectTitle || project.scenarioName,
        producers: [
            {
                id: 'black',
                in: '0',
                out: '1000',
                resource: '0',
                mlt_service: 'color',
                mlt_image_format: 'rgba',
            },
        ],
        playlists: [
            {
                id: 'background',
                entries: [
                    {
                        producer: 'black',
                        in: '0',
                        out: '1',
                    },
                ],
            },
            {
                id: 'playlist0',
                entries: [],
            },
            {
                id: 'playlist1',
                entries: [],
                blanks: [],
            },
            {
                id: 'playlist2',
                entries: [],
            },
        ],
        tractors: [
            {
                id: 'tractor0',
                shotcut: '1',
                'shotcut:projectAudioChannels': '2',
                'shotcut:projectFolder': '1',
                tracks: [
                    {
                        producer: 'background',
                    },
                    {
                        producer: 'playlist0',
                        hide: 'audio',
                    },
                    {
                        producer: 'playlist1',
                        hide: 'video',
                    },
                    {
                        producer: 'playlist2',
                        hide: 'video',
                    },
                ],
            },
        ],
    };

    let producerId = 0;
    let spentDuration = 0;
    const files: Array<string> = [];

    questions.map(async (q) => {
        let duration = 0;

        if (q.title != null) {
            producerId += 1;
            duration += q.title.duration;
            const titleDuration = Number((q.title.duration / 1000) * 25);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const style =
                q.title.style === ''
                    ? {
                          fontFamily: 'serif',
                          y: '10',
                          x: '35',
                          width: '50',
                      }
                    : JSON.parse(q.title.style);

            if (style.width == null) style.width = 50;
            const width = Math.floor((1920 * style.width) / 100);

            mlt.producers?.push({
                id: `producer${producerId}`,
                in: '0',
                out: `${titleDuration}`,
                resource: '#FF000000',
                mlt_service: 'color',
                mlt_image_format: 'rgba',
                length: `${titleDuration}`,
                filters: [
                    {
                        id: `filterForProducer${producerId}`,
                        argument: q.title.text,
                        geometry: `${Math.floor((1920 * style.x) / 100)} ${Math.floor((1080 * style.y) / 100)} ${width} 200 1`,
                        size: '120',
                        weight: '500',
                        style: 'normal',
                        fgcolour: '#ffffffff',
                        bgcolour: '#00000000',
                        olcolour: '#aa000000',
                        halign: 'center',
                        valign: 'middle',
                        mlt_service: 'dynamictext',
                        family: style.fontFamily === 'sans-serif' ? 'Arial' : 'Times New Roman',
                        'shotcut:filter': 'dynamicText',
                        'shotcut:usePointSize': '1',
                        'shotcut:pointSize': '120',
                    },
                ],
            });

            mlt.playlists?.[1]?.entries?.push({
                producer: `producer${producerId}`,
                in: '0',
                out: `${titleDuration}`,
            });

            spentDuration += titleDuration;
        }
        q.plans.map((p) => {
            producerId += 1;
            duration += p.duration || 0;
            const planDuration = Number(((p.duration || 0) / 1000) * 25);
            if (p.imageUrl != null) files.push(p.imageUrl);

            mlt.producers?.push({
                id: `producer${producerId}`,
                in: '0',
                out: `${planDuration}`,
                resource: `${p.imageUrl == null ? '' : p.imageUrl.replace('/api/images/', '')}`,
                mlt_service: 'qimage',
                length: `${planDuration}`,
            });

            mlt.playlists?.[1]?.entries?.push({
                producer: `producer${producerId}`,
                in: '0',
                out: `${planDuration}`,
            });

            spentDuration += planDuration;
        });
        if (q.soundUrl != null) {
            files.push(q.soundUrl);
            producerId += 1;
            mlt.producers?.push({
                id: `producer${producerId}`,
                in: `0`,
                out: `${(duration / 1000) * 25}`,
                resource: q.soundUrl.replace('/api/audios/', ''),
                length: `${(duration / 1000) * 25}`,
            });

            mlt.playlists?.[2]?.entries?.push({
                producer: `producer${producerId}`,
                in: `${0}`,
                out: `${(duration / 1000) * 25}`,
            });
        } else {
            mlt.playlists?.[2]?.blanks?.push({
                length: `${(duration / 1000) * 25}`,
            });
        }
    });

    if (project.soundUrl) {
        producerId += 1;
        files.push(project.soundUrl);
        mlt.producers?.push({
            id: `producer${producerId}`,
            in: '0',
            out: `${spentDuration}`,
            resource: `${project.soundUrl.replace('/api/audios/', '')}`,
            length: `${spentDuration}`,
        });

        mlt.playlists?.[3]?.entries?.push({
            producer: `producer${producerId}`,
            in: '0',
            out: `${spentDuration}`,
        });
    }

    const mltStr = mltToXml(mlt);
    // eslint-disable-next-line no-console
    console.log(mltStr);

    return {
        mlt: mltStr,
        files,
    };
}
