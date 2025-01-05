import React from 'react';
import useSWR from 'swr';
import WaveformData from 'waveform-data';

import { CircularProgress } from 'src/components/layout/CircularProgress';
import { Flex } from 'src/components/layout/Flex';
import { useDebounce } from 'src/hooks/useDebounced';

const DISPLAYED_SAMPLE = 200;

const range = 256;
function scaleY(canvasHeight: number, amplitude: number) {
    return canvasHeight / 2 - (amplitude * canvasHeight) / range;
}

function cloneAudioBuffer(fromAudioBuffer: AudioBuffer): AudioBuffer {
    const audioBuffer = new AudioBuffer({
        length: fromAudioBuffer.length,
        numberOfChannels: fromAudioBuffer.numberOfChannels,
        sampleRate: fromAudioBuffer.sampleRate,
    });
    for (let channelI = 0; channelI < audioBuffer.numberOfChannels; ++channelI) {
        const samples = fromAudioBuffer.getChannelData(channelI);
        audioBuffer.copyToChannel(samples, channelI);
    }
    return audioBuffer;
}

const getAudioBuffer = async (soundUrl: string) => {
    if (!soundUrl) {
        return undefined;
    }
    const audioContext = new AudioContext();
    const response = await fetch(soundUrl);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
};

async function getWaformData(audioBuffer: AudioBuffer, duration: number): Promise<WaveformData | null> {
    try {
        const scale = Math.floor((audioBuffer.sampleRate * (duration / 1000)) / DISPLAYED_SAMPLE);
        const options = {
            // eslint-disable-next-line camelcase
            audio_buffer: audioBuffer,
            scale, // number of samples per pixel.
        };
        return await new Promise((resolve, reject) => {
            WaveformData.createFromAudio(options, (err, waveform) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(waveform);
                }
            });
        });
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function updateWaformData(waveformData: WaveformData, duration: number): Promise<WaveformData | null> {
    const scale = Math.floor((waveformData.sample_rate * (duration / 1000)) / DISPLAYED_SAMPLE);
    return waveformData.resample({ scale });
}

type WaveFormProps = {
    soundUrl: string;
    time: number;
    duration: number;
    volume: number;
    beginTime: number;
    onUpdateSequenceDuration?: (newAudioDuration: number) => void;
};
export const WaveForm = ({ soundUrl, time, duration, volume, beginTime, onUpdateSequenceDuration }: WaveFormProps) => {
    const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
    const [waveform, setWaveForm] = React.useState<WaveformData | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const { data: audioBuffer, isLoading: isFetching } = useSWR(soundUrl, getAudioBuffer);

    // If audio change, get a new waveform.
    const waveformRef = React.useRef(waveform);
    waveformRef.current = waveform;
    const onUpdateSequenceDurationRef = React.useRef(onUpdateSequenceDuration);
    onUpdateSequenceDurationRef.current = onUpdateSequenceDuration;
    const prevSoundUrlRef = React.useRef('');
    React.useEffect(() => {
        if (prevSoundUrlRef.current !== soundUrl && audioBuffer !== undefined) {
            prevSoundUrlRef.current = soundUrl;
            setIsLoading(true);
            getWaformData(cloneAudioBuffer(audioBuffer), duration)
                .then(setWaveForm)
                .then(() => {
                    onUpdateSequenceDurationRef.current?.(Math.floor(audioBuffer.duration * 1000));
                })
                .catch(console.error)
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (waveformRef.current !== null) {
            updateWaformData(waveformRef.current, duration)
                .then(setWaveForm)
                .catch(() => {
                    if (audioBuffer !== undefined) {
                        getWaformData(cloneAudioBuffer(audioBuffer), duration).then(setWaveForm).catch(console.error);
                    } else {
                        setWaveForm(null);
                    }
                });
        } else {
            setWaveForm(null);
        }
    }, [audioBuffer, soundUrl, duration, waveformRef]);

    const debouncedVolume = useDebounce(volume, 100);
    React.useEffect(() => {
        const context = canvas?.getContext('2d');
        if (!canvas || !context || !waveform) {
            return;
        }

        const dpi = window.devicePixelRatio;
        const canvasHeight = canvas.clientHeight;
        const canvasWidth = canvas.clientWidth;
        canvas.width = canvasWidth * dpi;
        canvas.height = canvasHeight * dpi;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        context.scale(dpi, dpi);

        const channel = waveform.channel(0);
        const dx = canvasWidth / DISPLAYED_SAMPLE;
        const offsetX = (DISPLAYED_SAMPLE / duration) * beginTime * dx;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.translate(offsetX + 0.5, 0.5);
        const playedIndex = waveform.at_time((time - beginTime) / 1000);

        // Loop forwards, drawing the upper half of the waveform
        for (let x = 0; x < waveform.length; x++) {
            const top = scaleY(canvasHeight, (channel.max_sample(x) * debouncedVolume) / 100);
            const bottom = scaleY(canvasHeight, (channel.min_sample(x) * debouncedVolume) / 100);
            const left = x * dx + 1;
            const right = (x + 1) * dx - 1;
            if (x <= playedIndex) {
                context.fillStyle = '#638763';
            } else {
                context.fillStyle = 'rgb(76, 76, 76)';
            }
            context.fillRect(left, bottom, right - left, top - bottom);
        }
    }, [canvas, waveform, time, debouncedVolume, duration, beginTime]);

    if ((isLoading || isFetching) && !waveform) {
        return (
            <Flex isFullHeight isFullWidth alignItems="center" justifyContent="center">
                <CircularProgress color="secondary" size={20} />
            </Flex>
        );
    }

    return (
        <canvas
            ref={(ref) => {
                setCanvas(ref);
            }}
            style={{ height: '80px', width: '100%' }}
        />
    );
};
