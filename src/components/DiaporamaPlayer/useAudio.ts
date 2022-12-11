import React from 'react';

import { useFollowingRef } from 'src/hooks/useFollowingRef';

export const useAudio = (soundUrl: string, volume: number) => {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    // Initialize audioRef on soundUrl change. (Ignore volume with a ref.)
    const volumeRef = useFollowingRef(volume);
    React.useEffect(() => {
        if (soundUrl) {
            audioRef.current = new Audio(soundUrl);
            audioRef.current.volume = volumeRef.current / 100;
        } else {
            audioRef.current = null;
        }
    }, [soundUrl, volumeRef]);

    const onUpdateVolume = React.useCallback((newVolume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    }, []);

    const onPlay = React.useCallback(() => {
        if (
            audioRef.current &&
            audioRef.current.paused &&
            (Number.isNaN(audioRef.current.duration) || audioRef.current.currentTime < (audioRef.current.duration || 0))
        ) {
            audioRef.current.play();
        }
    }, []);

    const onStop = React.useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, []);

    const onUpdateCurrentTime = React.useCallback(
        (time: number, beginTime: number) => {
            const newCurrentTime = (time - beginTime) / 1000;
            // Update audio time
            if (audioRef.current && newCurrentTime >= 0) {
                audioRef.current.currentTime = newCurrentTime;
            } else if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
            onStop();
        },
        [onStop],
    );

    return { onPlay, onStop, onUpdateVolume, onUpdateCurrentTime };
};
