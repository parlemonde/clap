export const MAX_AUDIO_VOLUME = 200;

export const getClampedAudioVolume = (volume: number) => Math.max(0, Math.min(MAX_AUDIO_VOLUME, volume));

export const getAudioVolumeGain = (volume: number) => getClampedAudioVolume(volume) / 100;
