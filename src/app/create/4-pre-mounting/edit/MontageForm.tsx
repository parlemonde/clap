import { FileTextIcon, SpeakerLoudIcon, TimerIcon, UploadIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { DiaporamaPlayer } from '@frontend/components/create/DiaporamaPlayer';
import { Button } from '@frontend/components/layout/Button';
import { Flex, FlexItem } from '@frontend/components/layout/Flex';
import { Field, Form, TextArea } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { uploadSound } from '@frontend/lib/upload-sound';
import type { Sound } from '@lib/get-sounds';
import type { Sequence } from '@server/database/schemas/projects';
import { deleteSound } from '@server-actions/files/delete-sound';

interface MontageFormProps {
    sequence: Sequence;
    setSequence: (sequence: Sequence) => void;
    onSubmit: (sequence: Sequence) => void;
    feedbackForm?: React.ReactNode;
}
export const MontageForm = ({ sequence, setSequence, onSubmit, feedbackForm }: MontageFormProps) => {
    const t = useExtracted('create.4-pre-mounting.edit.MontageForm');
    const commonT = useExtracted('common');

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
                    message: commonT("Une erreur est survenue lors de l'importation du son."),
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
                        {t("Écrivez ici le texte de la voix-off. Il s'agit du commentaire audio qui peut accompagner votre séquence.")}
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
                        placeholder={t(
                            'Vous pourrez enregistrer un élève ou plusieurs élèves lire cette voix-off avec un microphone, comme celui de votre smartphone.\nPensez à enregistrer cette voix-off dans un environnement sonore calme.\nSi vous utilisez votre smartphone, pensez à le mettre en mode avion.\nRendez-vous en bas de cette page pour ajouter votre fichier son à la séquence. ',
                        )}
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
                        {t('Ajustez ici la durée totale de la séquence, ainsi que la durée relative des plans.')}
                    </Title>
                </FlexItem>
            </Flex>
            <DiaporamaPlayer
                canEdit
                canEditPlans
                questions={diaporamaSequences}
                setQuestion={setSequence}
                soundUrl={soundUrl}
                volume={sequence.soundVolume ?? 100}
                setVolume={(newVolume) => {
                    setSequence({ ...sequence, soundVolume: newVolume });
                }}
                soundBeginTime={sequence.voiceOffBeginTime || 0}
                setSoundBeginTime={(newSoundBeginTime) => {
                    setSequence({ ...sequence, voiceOffBeginTime: newSoundBeginTime });
                }}
                sounds={sounds}
            />

            {/* Sound */}
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" marginTop="lg" marginBottom="md">
                <div className={`pill ${soundUrl ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <SpeakerLoudIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t(
                            "Mettez en ligne la voix-off que vous avez enregistrée.\n Vous pourrez ensuite l'ajuster à la séquence et régler son volume, dans la table de montage ci-dessus.",
                        )}
                    </Title>
                </FlexItem>
            </Flex>
            <div className="text-center">
                <label htmlFor="sequence-sound-upload" className="text-center" style={{ marginBottom: '10px' }}>
                    {t('Formats acceptés : .aac, .ogg, .opus, .mp3, .wav')}
                </label>
                <Button
                    label={t('Importer un son')}
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
            {feedbackForm}
            <NextButton label={commonT('Continuer')} backHref="/create/4-pre-mounting" type="submit" />
            <Loader isLoading={isUploading} />
        </Form>
    );
};
