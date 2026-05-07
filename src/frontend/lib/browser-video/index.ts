import {
    AudioBufferSource,
    BufferTarget,
    CanvasSource,
    Mp4OutputFormat,
    Output,
    QUALITY_MEDIUM,
    QUALITY_VERY_HIGH,
    StreamTarget,
    type StreamTargetChunk,
    WebMOutputFormat,
    canEncodeAudio,
    canEncodeVideo,
    type AudioCodec,
    type VideoCodec,
} from 'mediabunny';

import { getProjectDuration } from '@lib/get-project-duration';
import { getSequenceDuration, isSequenceAvailable } from '@lib/get-sequence-duration';
import type { Plan, ProjectData, Sequence, Title } from '@server/database/schemas/projects';

const WIDTH = 1920;
const HEIGHT = 1080;
const FRAMERATE = 25;
const FRAME_DURATION_SECONDS = 1 / FRAMERATE;
const SAMPLE_RATE = 48_000;
const CHANNEL_COUNT = 2;
const VIDEO_BITRATE = 3_000_000;
const AUDIO_BITRATE = 128_000;
const MAX_BUFFER_TARGET_BYTES = 250 * 1024 * 1024;
const MAX_AUDIO_VOLUME = 200;
const PROGRESS_RANGES: Record<BrowserVideoProgressStage, { start: number; end: number }> = {
    'checking-support': { start: 0, end: 2 },
    'loading-assets': { start: 2, end: 20 },
    rendering: { start: 20, end: 95 },
    finalizing: { start: 95, end: 100 },
};

const getVolumeGain = (volume: number) => Math.max(0, Math.min(MAX_AUDIO_VOLUME, volume)) / 100;

type VisualSegment =
    | {
          kind: 'title';
          startMs: number;
          durationMs: number;
          title: Title;
      }
    | {
          kind: 'image';
          startMs: number;
          durationMs: number;
          plan: Plan;
      }
    | {
          kind: 'blank';
          startMs: number;
          durationMs: number;
      };

type AudioClip = {
    url: string;
    startMs: number;
    offsetMs: number;
    durationMs: number;
    volume: number;
};

export type BrowserVideoTimeline = {
    durationMs: number;
    visualSegments: VisualSegment[];
    audioClips: AudioClip[];
};

export type BrowserVideoSupport =
    | {
          supported: true;
          container: 'mp4' | 'webm';
          videoCodec: VideoCodec;
          audioCodec: AudioCodec;
          mimeType: string;
          extension: 'mp4' | 'webm';
      }
    | {
          supported: false;
          reason: 'missing-webcodecs' | 'missing-codecs';
      };

export type BrowserVideoProgressStage = 'checking-support' | 'loading-assets' | 'rendering' | 'finalizing';

type RenderProjectVideoCallbacks = {
    onProgress?: (progress: { stage: BrowserVideoProgressStage; percentage: number }) => void;
};

type RenderProjectVideoOptions = {
    signal?: AbortSignal;
    support?: BrowserVideoSupport;
    target?: RenderProjectVideoTarget;
};

type RenderProjectVideoTarget =
    | {
          kind: 'buffer';
      }
    | {
          kind: 'stream';
          writable: WritableStream<StreamTargetChunk>;
      };

export class BrowserVideoCanceledError extends Error {
    constructor() {
        super('Browser video rendering was canceled.');
        this.name = 'BrowserVideoCanceledError';
    }
}

const isCanceledError = (error: unknown): boolean => {
    return error instanceof DOMException && error.name === 'AbortError';
};

const throwIfCanceled = (signal?: AbortSignal) => {
    if (signal?.aborted) {
        throw new BrowserVideoCanceledError();
    }
};

const getEstimatedOutputSize = (durationMs: number): number => {
    return ((VIDEO_BITRATE + AUDIO_BITRATE) * (durationMs / 1000)) / 8;
};

const getMaxBufferTargetDurationMs = (): number => {
    return (MAX_BUFFER_TARGET_BYTES * 8 * 1000) / (VIDEO_BITRATE + AUDIO_BITRATE);
};

export class BrowserVideoDurationLimitError extends Error {
    maxDurationMs: number;

    constructor(maxDurationMs: number) {
        super('Project is too long for browser memory export.');
        this.name = 'BrowserVideoDurationLimitError';
        this.maxDurationMs = maxDurationMs;
    }
}

export function buildTimeline(project: ProjectData): BrowserVideoTimeline {
    const questions = project.questions.filter((question) => isSequenceAvailable(question));
    const visualSegments: VisualSegment[] = [];
    const audioClips: AudioClip[] = [];
    let currentMs = 0;

    for (const question of questions) {
        const questionStartMs = currentMs;
        const questionDurationMs = getSequenceDuration(question);

        if (question.title) {
            visualSegments.push({
                kind: 'title',
                startMs: currentMs,
                durationMs: question.title.duration,
                title: question.title,
            });
            currentMs += question.title.duration;
        }

        for (const plan of question.plans || []) {
            visualSegments.push(
                plan.imageUrl
                    ? {
                          kind: 'image',
                          startMs: currentMs,
                          durationMs: plan.duration,
                          plan,
                      }
                    : {
                          kind: 'blank',
                          startMs: currentMs,
                          durationMs: plan.duration,
                      },
            );
            currentMs += plan.duration;
        }

        addQuestionAudioClip(audioClips, question, questionStartMs, questionDurationMs);
    }

    const durationMs = getProjectDuration(questions);
    if (project.soundUrl && (project.soundVolume ?? 100) > 0) {
        audioClips.push({
            url: project.soundUrl,
            startMs: Math.max(0, project.soundBeginTime || 0),
            offsetMs: Math.max(0, -(project.soundBeginTime || 0)),
            durationMs: Math.max(0, durationMs - Math.max(0, project.soundBeginTime || 0)),
            volume: getVolumeGain(project.soundVolume ?? 100),
        });
    }

    return {
        durationMs,
        visualSegments,
        audioClips: audioClips.filter((clip) => clip.durationMs > 0 && clip.volume > 0),
    };
}

function addQuestionAudioClip(audioClips: AudioClip[], question: Sequence, questionStartMs: number, questionDurationMs: number) {
    if (!question.soundUrl || (question.soundVolume ?? 100) <= 0 || questionDurationMs <= 0) {
        return;
    }

    const beginTimeMs = question.voiceOffBeginTime ?? 0;
    audioClips.push({
        url: question.soundUrl,
        startMs: questionStartMs + Math.max(0, beginTimeMs),
        offsetMs: Math.max(0, -beginTimeMs),
        durationMs: Math.max(0, questionDurationMs - Math.max(0, beginTimeMs)),
        volume: getVolumeGain(question.soundVolume ?? 100),
    });
}

export async function loadImageAsset(url: string, signal?: AbortSignal): Promise<ImageBitmap> {
    const response = await fetch(url, { credentials: 'include', signal });
    if (!response.ok) {
        throw new Error(`Unable to load image asset: ${url}`);
    }

    return createImageBitmap(await response.blob());
}

export async function loadAudioAsset(url: string, audioContext: BaseAudioContext, signal?: AbortSignal): Promise<AudioBuffer> {
    const response = await fetch(url, { credentials: 'include', signal });
    if (!response.ok) {
        throw new Error(`Unable to load audio asset: ${url}`);
    }

    return audioContext.decodeAudioData(await response.arrayBuffer());
}

export async function detectBrowserVideoSupport(): Promise<BrowserVideoSupport> {
    if (typeof VideoEncoder === 'undefined' || typeof AudioEncoder === 'undefined') {
        return {
            supported: false,
            reason: 'missing-webcodecs',
        };
    }

    const canEncodeMp4Video = await canEncodeVideo('avc', {
        width: WIDTH,
        height: HEIGHT,
        bitrate: VIDEO_BITRATE,
    });
    const canEncodeMp4Audio = await canEncodeAudio('aac', {
        numberOfChannels: CHANNEL_COUNT,
        sampleRate: SAMPLE_RATE,
        bitrate: AUDIO_BITRATE,
    });

    if (canEncodeMp4Video && canEncodeMp4Audio) {
        return {
            supported: true,
            container: 'mp4',
            videoCodec: 'avc',
            audioCodec: 'aac',
            mimeType: 'video/mp4',
            extension: 'mp4',
        };
    }

    const canEncodeVp9 = await canEncodeVideo('vp9', {
        width: WIDTH,
        height: HEIGHT,
        bitrate: VIDEO_BITRATE,
    });
    const canEncodeVp8 = await canEncodeVideo('vp8', {
        width: WIDTH,
        height: HEIGHT,
        bitrate: VIDEO_BITRATE,
    });
    const canEncodeWebMVideo = canEncodeVp9 || canEncodeVp8;
    const videoCodec = canEncodeVp9 ? 'vp9' : 'vp8';
    const canEncodeWebMAudio = await canEncodeAudio('opus', {
        numberOfChannels: CHANNEL_COUNT,
        sampleRate: SAMPLE_RATE,
        bitrate: AUDIO_BITRATE,
    });

    if (canEncodeWebMVideo && canEncodeWebMAudio) {
        return {
            supported: true,
            container: 'webm',
            videoCodec,
            audioCodec: 'opus',
            mimeType: 'video/webm',
            extension: 'webm',
        };
    }

    return {
        supported: false,
        reason: 'missing-codecs',
    };
}

export async function renderProjectVideo(
    project: ProjectData,
    options: RenderProjectVideoOptions = {},
    callbacks: RenderProjectVideoCallbacks = {},
): Promise<
    | {
          kind: 'blob';
          blob: Blob;
          mimeType: string;
          extension: 'mp4' | 'webm';
      }
    | {
          kind: 'file';
          mimeType: string;
          extension: 'mp4' | 'webm';
      }
> {
    const emitProgress = (stage: BrowserVideoProgressStage, stagePercentage: number) => {
        const range = PROGRESS_RANGES[stage];
        const clampedStagePercentage = Math.max(0, Math.min(100, stagePercentage));
        callbacks.onProgress?.({
            stage,
            percentage: range.start + ((range.end - range.start) * clampedStagePercentage) / 100,
        });
    };

    emitProgress('checking-support', 0);
    throwIfCanceled(options.signal);

    const support = options.support || (await detectBrowserVideoSupport());
    if (!support.supported) {
        throw new Error('Browser video generation is not supported in this browser.');
    }

    const timeline = buildTimeline(project);
    if (timeline.durationMs <= 0) {
        throw new Error('Cannot render an empty project.');
    }

    const renderTarget = options.target || { kind: 'buffer' };
    if (renderTarget.kind === 'buffer' && getEstimatedOutputSize(timeline.durationMs) > MAX_BUFFER_TARGET_BYTES) {
        throw new BrowserVideoDurationLimitError(getMaxBufferTargetDurationMs());
    }

    emitProgress('checking-support', 100);
    emitProgress('loading-assets', 0);
    const imageAssets = await loadImageAssets(timeline, options.signal, (percentage) => {
        emitProgress('loading-assets', percentage * 0.5);
    });
    const audioBuffer = await renderAudioMix(timeline, options.signal, (percentage) => {
        emitProgress('loading-assets', 50 + percentage * 0.5);
    });
    throwIfCanceled(options.signal);

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Unable to create canvas context.');
    }

    const bufferTarget = renderTarget.kind === 'buffer' ? new BufferTarget() : null;
    const target = renderTarget.kind === 'stream' ? new StreamTarget(renderTarget.writable, { chunked: true }) : bufferTarget;
    if (!target) {
        throw new Error('Unable to create video output target.');
    }
    const output = new Output({
        format: support.container === 'mp4' ? new Mp4OutputFormat() : new WebMOutputFormat(),
        target,
    });
    const videoSource = new CanvasSource(canvas, {
        codec: support.videoCodec,
        bitrate: renderTarget.kind === 'stream' ? QUALITY_VERY_HIGH : QUALITY_MEDIUM,
        keyFrameInterval: 2,
    });
    const audioSource = audioBuffer
        ? new AudioBufferSource({
              codec: support.audioCodec,
              bitrate: AUDIO_BITRATE,
          })
        : null;

    output.addVideoTrack(videoSource, { frameRate: FRAMERATE });
    if (audioSource) {
        output.addAudioTrack(audioSource);
    }

    const cancelOutput = () => {
        if (output.state === 'started' || output.state === 'pending') {
            output.cancel().catch(console.error);
        }
    };
    options.signal?.addEventListener('abort', cancelOutput, { once: true });

    let didFinalize = false;
    try {
        await output.start();

        if (audioSource && audioBuffer) {
            await audioSource.add(audioBuffer);
        }

        await renderVideoFrames(timeline, context, videoSource, imageAssets, options.signal, (percentage) => {
            emitProgress('rendering', percentage);
        });

        emitProgress('finalizing', 0);
        throwIfCanceled(options.signal);
        await output.finalize();
        didFinalize = true;
        emitProgress('finalizing', 100);
    } catch (error) {
        if (!didFinalize && (output.state === 'pending' || output.state === 'started' || output.state === 'finalizing')) {
            await output.cancel().catch(console.error);
        }
        throw error;
    } finally {
        options.signal?.removeEventListener('abort', cancelOutput);
        videoSource.close();
        audioSource?.close();
        for (const image of imageAssets.values()) {
            image.close();
        }
    }

    const preciseMimeType = await output.getMimeType().catch(() => support.mimeType);
    if (renderTarget.kind === 'stream') {
        return {
            kind: 'file',
            mimeType: preciseMimeType,
            extension: support.extension,
        };
    }

    if (!bufferTarget?.buffer) {
        throw new Error('Video rendering did not produce an output buffer.');
    }

    return {
        kind: 'blob',
        blob: new Blob([bufferTarget.buffer], { type: preciseMimeType }),
        mimeType: preciseMimeType,
        extension: support.extension,
    };
}

async function loadImageAssets(
    timeline: BrowserVideoTimeline,
    signal: AbortSignal | undefined,
    onProgress: (percentage: number) => void,
): Promise<Map<string, ImageBitmap>> {
    const imageUrls = [...new Set(timeline.visualSegments.flatMap((segment) => (segment.kind === 'image' ? [segment.plan.imageUrl] : [])))];
    const assets = new Map<string, ImageBitmap>();

    if (imageUrls.length === 0) {
        onProgress(100);
        return assets;
    }

    let loadedCount = 0;
    try {
        await Promise.all(
            imageUrls.map(async (url) => {
                throwIfCanceled(signal);
                const image = await loadImageAsset(url, signal);
                assets.set(url, image);
                loadedCount += 1;
                onProgress((loadedCount / imageUrls.length) * 100);
            }),
        );
    } catch (error) {
        for (const image of assets.values()) {
            image.close();
        }
        throw error;
    }

    return assets;
}

async function renderAudioMix(
    timeline: BrowserVideoTimeline,
    signal: AbortSignal | undefined,
    onProgress: (percentage: number) => void,
): Promise<AudioBuffer | null> {
    if (timeline.audioClips.length === 0) {
        onProgress(100);
        return null;
    }

    const offlineContext = new OfflineAudioContext(CHANNEL_COUNT, Math.ceil((timeline.durationMs / 1000) * SAMPLE_RATE), SAMPLE_RATE);
    const decodedAudio = new Map<string, AudioBuffer>();
    const audioUrls = [...new Set(timeline.audioClips.map((clip) => clip.url))];

    let decodedCount = 0;
    await Promise.all(
        audioUrls.map(async (url) => {
            throwIfCanceled(signal);
            const audio = await loadAudioAsset(url, offlineContext, signal);
            decodedAudio.set(url, audio);
            decodedCount += 1;
            onProgress((decodedCount / audioUrls.length) * 80);
        }),
    );

    for (const clip of timeline.audioClips) {
        const buffer = decodedAudio.get(clip.url);
        if (!buffer) {
            continue;
        }
        const availableDurationMs = Math.max(0, buffer.duration * 1000 - clip.offsetMs);
        const durationMs = Math.min(clip.durationMs, availableDurationMs);
        if (durationMs <= 0) {
            continue;
        }

        const source = offlineContext.createBufferSource();
        const gain = offlineContext.createGain();
        source.buffer = buffer;
        gain.gain.value = clip.volume;
        source.connect(gain).connect(offlineContext.destination);
        source.start(clip.startMs / 1000, clip.offsetMs / 1000, durationMs / 1000);
    }

    throwIfCanceled(signal);
    const renderedBuffer = await offlineContext.startRendering();
    onProgress(100);
    return renderedBuffer;
}

async function renderVideoFrames(
    timeline: BrowserVideoTimeline,
    context: CanvasRenderingContext2D,
    videoSource: CanvasSource,
    imageAssets: Map<string, ImageBitmap>,
    signal: AbortSignal | undefined,
    onProgress: (percentage: number) => void,
) {
    const frameCount = Math.ceil((timeline.durationMs / 1000) * FRAMERATE);
    let segmentIndex = 0;
    for (let frame = 0; frame < frameCount; frame++) {
        throwIfCanceled(signal);
        const timestamp = frame * FRAME_DURATION_SECONDS;
        const timeMs = timestamp * 1000;
        while (
            segmentIndex + 1 < timeline.visualSegments.length &&
            timeline.visualSegments[segmentIndex].startMs + timeline.visualSegments[segmentIndex].durationMs <= timeMs
        ) {
            segmentIndex += 1;
        }
        drawFrame(context, timeline.visualSegments[segmentIndex] || null, imageAssets);
        await videoSource.add(timestamp, FRAME_DURATION_SECONDS, {
            keyFrame: frame % (FRAMERATE * 2) === 0,
        });
        onProgress(((frame + 1) / frameCount) * 100);
    }
}

function drawFrame(context: CanvasRenderingContext2D, segment: VisualSegment | null, imageAssets: Map<string, ImageBitmap>) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    if (!segment || segment.kind === 'blank') {
        return;
    }

    if (segment.kind === 'image') {
        const image = imageAssets.get(segment.plan.imageUrl);
        if (image) {
            drawContainedImage(context, image);
        }
        return;
    }

    drawTitle(context, segment.title);
}

function drawContainedImage(context: CanvasRenderingContext2D, image: ImageBitmap) {
    const scale = Math.min(WIDTH / image.width, HEIGHT / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (WIDTH - width) / 2;
    const y = (HEIGHT - height) / 2;
    context.drawImage(image, x, y, width, height);
}

function drawTitle(context: CanvasRenderingContext2D, title: Title) {
    context.save();
    try {
        context.fillStyle = title.backgroundColor;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        const x = (title.x * WIDTH) / 100;
        const y = (title.y * HEIGHT) / 100;
        const width = (title.width * WIDTH) / 100;
        const height = Math.max(0, HEIGHT - y);
        const fontSize = Math.max(10, Math.min(HEIGHT / 4, (HEIGHT * title.fontSize) / 100));
        const lineHeight = fontSize * 1.1;
        const lines = wrapText(context, title.text, width, fontSize, title.fontFamily);
        const textAlign = title.textAlign === 'justify' ? 'left' : title.textAlign;
        const textX = textAlign === 'center' ? x + width / 2 : textAlign === 'right' ? x + width : x;

        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();
        context.font = `400 ${fontSize}px ${title.fontFamily}`;
        context.textBaseline = 'top';
        context.textAlign = textAlign;
        context.fillStyle = title.color;

        for (let index = 0; index < lines.length; index++) {
            const lineY = y + index * lineHeight;
            if (lineY + lineHeight > HEIGHT) {
                break;
            }
            context.fillText(lines[index], textX, lineY, width);
        }
    } finally {
        context.restore();
    }
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontFamily: string): string[] {
    context.save();
    try {
        context.font = `400 ${fontSize}px ${fontFamily}`;
        const lines: string[] = [];

        for (const paragraph of text.split('\n')) {
            const words = paragraph.split(/\s+/).filter(Boolean);
            if (words.length === 0) {
                lines.push('');
                continue;
            }

            let line = '';
            for (const word of words) {
                const testLine = line ? `${line} ${word}` : word;
                if (line && context.measureText(testLine).width > maxWidth) {
                    lines.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            lines.push(line);
        }

        return lines;
    } finally {
        context.restore();
    }
}

export function isBrowserVideoCanceledError(error: unknown): error is BrowserVideoCanceledError {
    return error instanceof BrowserVideoCanceledError || isCanceledError(error);
}

export function isBrowserVideoDurationLimitError(error: unknown): error is BrowserVideoDurationLimitError {
    return error instanceof BrowserVideoDurationLimitError;
}
