import { FileTextIcon, SpeakerLoudIcon, TimerIcon, UploadIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { deleteSound } from 'src/actions/delete-sound';
import { uploadSound } from 'src/actions/upload-sound';
import { DiaporamaPlayer } from 'src/components/create/DiaporamaPlayer';
import { Button } from 'src/components/layout/Button';
import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Field, Form, TextArea } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';
import type { Sequence } from 'src/hooks/useLocalStorage/local-storage';
import type { Sound } from 'src/lib/get-sounds';

interface MontageFormProps {
    sequence: Sequence;
    setSequence: (sequence: Sequence) => void;
    onSubmit: (sequence: Sequence) => void;
}
export const MontageForm = ({ sequence, setSequence, onSubmit }: MontageFormProps) => {
    const { t } = useTranslation();

    const [newSoundFile, setNewSoundFile] = React.useState<File | null | undefined>(undefined); // null = delete sound
    const newSoundUrl = React.useMemo(() => (newSoundFile ? URL.createObjectURL(newSoundFile) : null), [newSoundFile]);
    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setNewSoundFile(event.target.files[0]);
            setSequence({ ...sequence, voiceOffBeginTime: 0 }); // reset sound begin time
        }
        event.target.value = ''; // clear input
    };

    const [isUploading, setIsUploading] = React.useState(false);
    const onNext = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsUploading(true);
        const sequenceToSubmit = { ...sequence };

        // Remove old sound if needed.
        if (newSoundFile !== undefined && sequence.soundUrl) {
            try {
                await deleteSound(sequence.soundUrl);
            } catch {
                // Ignore error
            }
            sequenceToSubmit.soundUrl = '';
        }

        // Upload sound if needed.
        if (newSoundFile) {
            try {
                sequenceToSubmit.soundUrl = await uploadSound(newSoundFile);
            } catch (error) {
                console.error(error);
                sendToast({
                    message: t('error_upload_sound'),
                    type: 'error',
                });
                setIsUploading(false);
                return;
            }
        }

        onSubmit(sequenceToSubmit);
        setIsUploading(false);
    };

    const diaporamaSequences = React.useMemo(() => [sequence], [sequence]);
    const sounds = React.useMemo<Sound[]>(() => [], []);
    const soundUrl = newSoundUrl || sequence.soundUrl || '';

    return (
        <Form onSubmit={onNext}>
            {/* Voice text */}
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start">
                <div className={`pill ${sequence.voiceText ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <FileTextIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t('pre_mount_voice_off')}
                    </Title>
                </FlexItem>
            </Flex>
            <Field
                marginTop="sm"
                name="voice_text"
                input={
                    <TextArea
                        value={sequence.voiceText || ''}
                        onChange={(event) => {
                            setSequence({ ...sequence, voiceText: event.target.value.slice(0, 4000) });
                        }}
                        placeholder={t('part4_plan_desc_placeholder')}
                        isFullWidth
                        rows={4}
                        color="secondary"
                        autoComplete="off"
                    />
                }
                helperText={`${(sequence.voiceText || '').length}/4000`}
            ></Field>

            {/* Durations */}
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" marginTop="lg" marginBottom="sm">
                <div className="pill pill--green" style={{ marginRight: '10px' }}>
                    <TimerIcon style={{ height: '95%' }} />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t('pre_mount_duration')}
                    </Title>
                </FlexItem>
            </Flex>
            <DiaporamaPlayer
                canEdit
                canEditPlans
                questions={diaporamaSequences}
                setQuestion={setSequence}
                soundUrl={soundUrl}
                volume={sequence.soundVolume || 100}
                setVolume={(newVolume) => {
                    setSequence({ ...sequence, soundVolume: newVolume });
                }}
                soundBeginTime={sequence.voiceOffBeginTime || 0}
                setSoundBeginTime={(newSoundBeginTime) => {
                    setSequence({ ...sequence, voiceOffBeginTime: newSoundBeginTime });
                }}
                sounds={sounds}
                isQuestionEditing={true}
            />

            {/* Sound */}
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" marginTop="lg" marginBottom="md">
                <div className={`pill ${soundUrl ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <SpeakerLoudIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t('pre_mount_no_sound')}
                    </Title>
                </FlexItem>
            </Flex>
            <div className="text-center">
                <label htmlFor="sequence-sound-upload" className="text-center" style={{ marginBottom: '10px' }}>
                    Format accepté: .acc, .ogg, .opus, .mp3, .wav
                </label>
                <Button
                    label={t('import_voice_off')}
                    variant="outlined"
                    color="secondary"
                    as="label"
                    isUpperCase={false}
                    role="button"
                    aria-controls="filename"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            document.getElementById('sequence-sound-upload')?.click();
                        }
                    }}
                    htmlFor={'sequence-sound-upload'}
                    leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                ></Button>
            </div>
            <input
                id="sequence-sound-upload"
                type="file"
                accept="audio/acc, audio/mpeg, audio/ogg, audio/opus, audio/wav, audio/x-wav"
                onChange={onInputUpload}
                style={{ display: 'none' }}
            />
            <NextButton label={t('continue')} backHref="/create/4-pre-mounting" type="submit" />
            <Loader isLoading={isUploading} />
        </Form>
    );
};
