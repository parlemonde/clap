import React from 'react';

import type { Sound } from 'src/lib/get-sounds';

export const useAudio = (soundUrl: string, initialVolume: number, sounds: Sound[]) => {
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const gainNodeRef = React.useRef<GainNode | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const audioRefs = React.useRef<HTMLAudioElement[]>([]);

    const volumeRef = React.useRef(initialVolume);
    volumeRef.current = initialVolume;
    React.useEffect(() => {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        if (soundUrl) {
            audioRef.current = new Audio(soundUrl);
            audioRef.current.volume = 1;
            const track = new MediaElementAudioSourceNode(audioContext, {
                mediaElement: audioRef.current,
            });
            const gainNode = new GainNode(audioContext);
            gainNode.gain.value = volumeRef.current / 1000;
            gainNodeRef.current = gainNode;
            track.connect(gainNode).connect(audioContext.destination);
        }

        audioRefs.current = [];
        for (const sound of sounds) {
            const audio = new Audio(sound.soundUrl);
            audio.volume = 1;
            const track = new MediaElementAudioSourceNode(audioContext, {
                mediaElement: audio,
            });
            const gainNode = new GainNode(audioContext);
            gainNode.gain.value = sound.volume / 1000;
            track.connect(gainNode).connect(audioContext.destination);
            audioRefs.current.push(audio);
        }

        return () => {
            audioContext.close().catch(console.error);
        };
    }, [soundUrl, volumeRef, sounds]);

    const onUpdateVolume = React.useCallback((newVolume: number) => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume / 1000;
        }
    }, []);

    const onPlay = (time: number, beginTime: number) => {
        if (audioContextRef.current === null) {
            return;
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        }

        if (audioRef.current && audioRef.current.paused && time >= beginTime && time - beginTime < audioRef.current.duration * 1000) {
            audioRef.current.currentTime = (time - beginTime) / 1000;
            audioRef.current.play().catch(console.error);
        } else if (audioRef.current && !audioRef.current.paused && (time < beginTime || time - beginTime >= audioRef.current.duration * 1000)) {
            audioRef.current.pause();
        }

        for (let i = 0; i < sounds.length; i++) {
            const audio = audioRefs.current[i];
            const sound = sounds[i];
            if (!audio || !sound) {
                continue;
            }
            if (audio.paused && time >= sound.beginTime && time - sound.beginTime < Math.min(audio.duration * 1000, sound.maxDuration)) {
                audio.currentTime = (time - sound.beginTime + sound.deltaBeginTime) / 1000;
                audio.play().catch(console.error);
            } else if (!audio.paused && (time < sound.beginTime || time - sound.beginTime >= Math.min(audio.duration * 1000, sound.maxDuration))) {
                audio.pause();
            }
        }
    };

    const onStop = React.useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        for (const audio of audioRefs.current) {
            audio.pause();
        }
    }, []);

    const onUpdateCurrentTime = React.useCallback(
        (time: number, beginTime: number) => {
            if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, (time - beginTime) / 1000);
            }
            for (let i = 0; i < sounds.length; i++) {
                const audio = audioRefs.current[i];
                const sound = sounds[i];
                if (!audio || !sound) {
                    continue;
                }
                audio.currentTime = Math.max(0, (time - sound.beginTime) / 1000);
            }
        },
        [sounds],
    );

    return {
        onPlay,
        onStop,
        onUpdateVolume,
        onUpdateCurrentTime,
        audioRef,
    };
};
