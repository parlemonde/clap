import { mltToXml } from 'mlt-xml';

import type { Question } from '../entities/question';

export function objToXml(questions: Question[]) {
    const mlt = {
        title: 'watermarkOnVideo',
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
                ],
            },
        ],
    };

    let producerId = 0;
    let spentDuration = 0;

    questions.map(async (q) => {
        let duration = 0;

        if (q.title != null) {
            producerId += 1;
            duration += q.title.duration;
            const titleDuration = parseInt((q.title.duration / 1000) * 25);

            const style =
                q.title.style === ''
                    ? {
                          fontFamily: 'serif',
                          top: '10',
                          left: '35',
                      }
                    : JSON.parse(q.title.style);

            mlt.producers.push({
                id: `producer${producerId}`,
                in: `${spentDuration}`,
                out: `${spentDuration + titleDuration}`,
                resource: '#FF000000',
                mlt_service: 'color',
                mlt_image_format: 'rgba',
                length: `${titleDuration}`,
                filters: [
                    {
                        argument: q.title.text,
                        geometry: '466 389 1029 184 1',
                        size: '144',
                        weight: '500',
                        style: 'normal',
                        fgcolour: '#ffffffff',
                        bgcolour: '#00000000',
                        olcolour: '#aa000000',
                        halign: 'center',
                        valign: 'middle',
                        mlt_service: 'dynamictext',
                    },
                ],
            });

            mlt.playlists[1].entries.push({
                producer: `producer${producerId}`,
                in: `${spentDuration}`,
                out: `${spentDuration + titleDuration}`,
            });

            spentDuration += titleDuration;
        }
        q.plans.map((p) => {
            producerId += 1;
            duration += p.duration;
            const planDuration = parseInt((p.duration / 1000) * 25);

            mlt.producers.push({
                id: `producer${producerId}`,
                in: `${spentDuration}`,
                out: `${spentDuration + planDuration}`,
                resource: `${p.url}`,
                mlt_service: 'qimage',
                length: `${planDuration}`,
            });

            mlt.playlists[1].entries.push({
                producer: `producer${producerId}`,
                in: `${spentDuration}`,
                out: `${spentDuration + planDuration}`,
            });

            spentDuration += planDuration;
        });
        if (q.sound != null) {
            producerId += 1;
            mlt.producers.push({
                id: `producer${producerId}`,
                in: `0`,
                out: `${(duration / 1000) * 25}`,
                resource: `${q.sound.path}`,
                mlt_service: 'qimage',
                length: `${(duration / 1000) * 25}`,
            });

            mlt.playlists[2].entries.push({
                producer: `producer${producerId}`,
                in: `${0}`,
                out: `${spentDuration + (duration / 1000) * 25}`,
            });
        } else {
            mlt.playlists[2].blanks?.push({
                length: `${(duration / 1000) * 25}`,
            });
        }
    });

    const mltStr = mltToXml(mlt);
    console.log(mltStr);

    return mltStr;
}
