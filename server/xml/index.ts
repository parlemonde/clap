/* eslint-disable camelcase */
import type { MLT, Playlist } from 'mlt-xml';
import { mltToXml } from 'mlt-xml';
import type { FileType } from 'server/fileUpload';

import type { Question } from '../entities/question';

const WIDTH = 1920; // px
const HEIGHT = 1080; // px
const FRAMERATE = 25; // img/s

type Project = {
    projectTitle: string;
    scenarioName: string;
    soundUrl?: string | null;
    soundVolume?: number | null;
    musicBeginTime?: number;
};

type File = {
    fileType: FileType;
    name: string;
    isLocal: boolean;
};

const getFramesCount = (duration: number) => Math.round((duration * FRAMERATE) / 1000);
const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value));

const HOST_URL = process.env.HOST_URL;
const toFullUrl = (url: string) => {
    if (url.startsWith('/api')) {
        return `${HOST_URL}${url}`;
    } else {
        return url;
    }
};
const toLocalUrl = (url: string) => {
    return url.replace('/api/images/', '').replace('/api/audios/', '');
};

export function projectToMlt(allQuestions: Question[], project: Project, urlTransform: (url: string) => string = toFullUrl) {
    const questions = allQuestions.filter((q) => q.title !== null || (q.plans || []).some((plan) => plan.description || plan.imageUrl));
    const totalFrames = getFramesCount(
        questions.reduce(
            (d, sequence) =>
                d +
                Math.max(1000, sequence.title?.duration || 0) +
                (sequence.plans || []).reduce<number>((acc, plan) => acc + Math.max(1000, plan.duration || 0), 0),
            0,
        ),
    );
    const fileNames = new Set<string>();
    const files: Array<File> = [];

    const mlt: MLT = {
        title: project.projectTitle || project.scenarioName,
        elements: [
            {
                name: 'profile',
                attributes: {
                    description: 'PAL 4:3 DV or DVD',
                    width: WIDTH,
                    height: HEIGHT,
                    progressive: true,
                    sample_aspect_num: 1,
                    sample_aspect_den: 1,
                    frame_rate_num: FRAMERATE,
                    frame_rate_den: 1,
                    colorspace: '709',
                },
            },
            {
                name: 'producer',
                attributes: {
                    id: 'black',
                    in: 0,
                    out: totalFrames,
                    length: totalFrames,
                    resource: '0',
                    eof: 'pause',
                    aspect_ratio: 1,
                    mlt_service: 'color',
                    mlt_image_format: 'rgba',
                },
            },
        ],
    };

    const videoPlaylist: Required<Playlist> = {
        name: 'playlist',
        attributes: {
            id: 'video',
        },
        elements: [],
    };
    const audioPlaylist: Required<Playlist> = {
        name: 'playlist',
        attributes: {
            id: 'audio1',
        },
        elements: [],
    };
    let producerId = 0;
    let spentDuration = 0;
    for (const question of questions) {
        let questionDuration = 0;

        // [1] Add question title
        if (question.title) {
            const titleDuration = getFramesCount(question.title.duration || 1000);
            questionDuration += titleDuration;
            spentDuration += titleDuration;

            let style: Record<string, string | number>;
            try {
                style = JSON.parse(question.title.style);
            } catch (err) {
                // fail silently
                style = {};
            }

            const x = clamp(0, WIDTH, Math.round((WIDTH * Number(style.x ?? 15) || 0) / 100));
            const y = clamp(0, HEIGHT, Math.round((HEIGHT * Number(style.y ?? 30) || 0) / 100));
            const width = clamp(0, WIDTH - x, Math.round((WIDTH * Number(style.width ?? 70) || 0) / 100));
            const height = HEIGHT - y;

            const fontSize = clamp(10, HEIGHT / 4, Math.round((HEIGHT * Number(style.fontSize ?? 8) || 0) / 100));

            producerId += 1;
            mlt.elements.push({
                name: 'producer',
                attributes: {
                    id: `producer${producerId}`,
                    in: 0,
                    out: titleDuration,
                    resource: '#00000000',
                    mlt_service: 'color',
                    mlt_image_format: 'rgba',
                    length: titleDuration,
                    aspect_ratio: 1,
                    eof: 'pause',
                },
                elements: [
                    {
                        name: 'filter',
                        attributes: {
                            id: `filterForProducer${producerId}`,
                            argument: question.title.text,
                            geometry: `${x} ${y} ${width} ${height} 1`,
                            size: fontSize,
                            weight: '500',
                            style: 'normal',
                            fgcolour: '#ffffffff',
                            bgcolour: '#00000000',
                            olcolour: '#aa000000',
                            halign: 'center',
                            valign: 'top',
                            mlt_service: 'dynamictext',
                            family: style.fontFamily === 'sans-serif' ? 'Arial' : 'Times New Roman',
                            'shotcut:filter': 'dynamicText',
                            'shotcut:usePointSize': '1',
                            'shotcut:pointSize': fontSize,
                        },
                    },
                ],
            });
            videoPlaylist.elements.push({
                name: 'entry',
                attributes: {
                    producer: `producer${producerId}`,
                    in: '0',
                    out: `${titleDuration}`,
                },
            });
        }

        // [2] Add plans
        for (const plan of question.plans || []) {
            const planDuration = getFramesCount(plan.duration || 1000);
            questionDuration += planDuration;
            spentDuration += planDuration;

            if (plan.imageUrl) {
                if (!fileNames.has(plan.imageUrl)) {
                    fileNames.add(plan.imageUrl);
                    files.push({
                        fileType: 'images',
                        name: plan.imageUrl.replace('/api/images/', ''),
                        isLocal: plan.imageUrl.startsWith('/api'),
                    });
                }
                producerId += 1;
                mlt.elements.push({
                    name: 'producer',
                    attributes: {
                        id: `producer${producerId}`,
                        in: 0,
                        out: planDuration,
                        resource: urlTransform(plan.imageUrl),
                        mlt_service: 'qimage',
                        length: planDuration,
                        eof: 'pause',
                        ttl: 1,
                        aspect_ratio: 1,
                    },
                });
                videoPlaylist.elements.push({
                    name: 'entry',
                    attributes: {
                        producer: `producer${producerId}`,
                        in: '0',
                        out: `${planDuration}`,
                    },
                });
            } else {
                videoPlaylist.elements.push({
                    name: 'blank',
                    attributes: {
                        length: `${planDuration}`,
                    },
                });
            }
        }

        // [3] Add sound
        if (question.soundUrl && (question.soundVolume ?? 100) > 0) {
            const blankDuration = getFramesCount(Math.max(0, question.voiceOffBeginTime || 0));
            const deltaSound = -getFramesCount(Math.min(0, question.voiceOffBeginTime || 0));
            const audioDuration = questionDuration - blankDuration;
            if (blankDuration > 0) {
                audioPlaylist.elements.push({
                    name: 'blank',
                    attributes: {
                        length: `${blankDuration}`,
                    },
                });
            }

            const volume = clamp(0.01, 1.5, (question.soundVolume || 100) / 100);
            const gain = Math.round(2000 * Math.log10(volume)) / 100;

            if (!fileNames.has(question.soundUrl)) {
                fileNames.add(question.soundUrl);
                files.push({
                    fileType: 'audios',
                    name: question.soundUrl.replace('/api/audios/', ''),
                    isLocal: question.soundUrl.startsWith('/api'),
                });
            }

            producerId += 1;
            mlt.elements.push({
                name: 'producer',
                attributes: {
                    id: `producer${producerId}`,
                    in: deltaSound,
                    out: audioDuration + deltaSound,
                    resource: urlTransform(question.soundUrl),
                    length: audioDuration,
                    eof: 'pause',
                    mlt_service: 'avformat-novalidate',
                    audio_index: 0,
                    video_index: -1,
                },
                elements:
                    volume !== 1
                        ? [
                              {
                                  name: 'filter',
                                  attributes: {
                                      id: `filterForProducer${producerId}`,
                                      in: 0,
                                      out: audioDuration,
                                      window: 75,
                                      max_gain: '20dB',
                                      level: gain,
                                      mlt_service: 'volume',
                                  },
                              },
                          ]
                        : undefined,
            });
            audioPlaylist.elements.push({
                name: 'entry',
                attributes: {
                    producer: `producer${producerId}`,
                    in: `${0}`,
                    out: `${audioDuration}`,
                },
            });
        } else {
            audioPlaylist.elements.push({
                name: 'blank',
                attributes: {
                    length: `${questionDuration}`,
                },
            });
        }
    }

    const projectAudioPlaylist: Required<Playlist> = {
        name: 'playlist',
        attributes: {
            id: 'audio2',
        },
        elements: [],
    };
    if (project.soundUrl) {
        const blankDuration = getFramesCount(Math.max(0, project.musicBeginTime || 0));
        const deltaSound = -getFramesCount(Math.min(0, project.musicBeginTime || 0));
        const audioDuration = Math.max(totalFrames, spentDuration) - blankDuration;
        if (blankDuration > 0) {
            projectAudioPlaylist.elements.push({
                name: 'blank',
                attributes: {
                    length: `${blankDuration}`,
                },
            });
        }

        const volume = clamp(0.01, 1.5, (project.soundVolume || 100) / 100);
        const gain = Math.round(2000 * Math.log10(volume)) / 100;

        producerId += 1;
        if (!fileNames.has(project.soundUrl)) {
            fileNames.add(project.soundUrl);
            files.push({
                fileType: 'audios',
                name: project.soundUrl.replace('/api/audios/', ''),
                isLocal: project.soundUrl.startsWith('/api'),
            });
        }

        mlt.elements.push({
            name: 'producer',
            attributes: {
                id: `producer${producerId}`,
                in: deltaSound,
                out: audioDuration + deltaSound,
                resource: urlTransform(project.soundUrl),
                length: audioDuration,
                eof: 'pause',
                mlt_service: 'avformat-novalidate',
                audio_index: 0,
                video_index: -1,
            },
            elements:
                volume !== 1
                    ? [
                          {
                              name: 'filter',
                              attributes: {
                                  id: `filterForProducer${producerId}`,
                                  in: 0,
                                  out: audioDuration,
                                  window: 75,
                                  max_gain: '20dB',
                                  level: gain,
                                  mlt_service: 'volume',
                              },
                          },
                      ]
                    : undefined,
        });
        projectAudioPlaylist.elements.push({
            name: 'entry',
            attributes: {
                producer: `producer${producerId}`,
                in: '0',
                out: `${audioDuration}`,
            },
        });
    }

    // [4] Add playlists
    mlt.elements.push({
        name: 'playlist',
        attributes: {
            id: 'background',
        },
        elements: [
            {
                name: 'entry',
                attributes: {
                    producer: 'black',
                    in: '0',
                    out: `${Math.max(totalFrames, spentDuration)}`, // should be the same number
                },
            },
        ],
    });
    mlt.elements.push(videoPlaylist);
    mlt.elements.push(audioPlaylist);
    mlt.elements.push(projectAudioPlaylist);
    mlt.elements.push({
        name: 'tractor',
        attributes: {
            id: 'tractor0',
            shotcut: '1',
            'shotcut:projectAudioChannels': '2',
            'shotcut:projectFolder': '1',
        },
        elements: [
            {
                name: 'track',
                attributes: {
                    producer: 'background',
                },
            },
            {
                name: 'track',
                attributes: {
                    producer: 'video',
                    hide: 'audio',
                },
            },
            {
                name: 'track',
                attributes: {
                    producer: 'audio1',
                    hide: 'video',
                },
            },
            {
                name: 'track',
                attributes: {
                    producer: 'audio2',
                    hide: 'video',
                },
            },
            {
                name: 'transition',
                attributes: {
                    id: 'transition0',
                    a_track: 0,
                    b_track: 1,
                    mlt_service: 'mix',
                    always_active: true,
                    sum: 1,
                },
            },
            {
                name: 'transition',
                attributes: {
                    id: 'transition1',
                    a_track: 0,
                    b_track: 2,
                    mlt_service: 'mix',
                    always_active: true,
                    sum: 1,
                },
            },
            {
                name: 'transition',
                attributes: {
                    id: 'transition2',
                    a_track: 0,
                    b_track: 3,
                    mlt_service: 'mix',
                    always_active: true,
                    sum: 1,
                },
            },
        ],
    });

    return {
        mlt: mlt,
        files: [...files],
    };
}

export function projectToXml(allQuestions: Question[], project: Project) {
    const { mlt, files } = projectToMlt(allQuestions, project, toLocalUrl);
    const mltStr = mltToXml(mlt);

    return {
        mlt: mltStr,
        files: [...files],
    };
}
