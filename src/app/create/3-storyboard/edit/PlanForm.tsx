import { CameraIcon, ImageIcon, LightningBoltIcon, Pencil2Icon, UploadIcon } from '@radix-ui/react-icons';
import Image from 'next/legacy/image';
import { useExtracted } from 'next-intl';
import React from 'react';
import Camera from 'react-html5-camera-photo';

import { Canvas } from '@frontend/components/create/Canvas';
import { Button } from '@frontend/components/layout/Button';
import { Flex, FlexItem } from '@frontend/components/layout/Flex';
import { Field, Form, TextArea } from '@frontend/components/layout/Form';
import { KeepRatio } from '@frontend/components/layout/KeepRatio';
import { Modal } from '@frontend/components/layout/Modal';
import { Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Cropper } from '@frontend/components/ui/Cropper';
import { Loader } from '@frontend/components/ui/Loader';
import { sendToast } from '@frontend/components/ui/Toasts';
import { deleteLocalMedia, insertLocalMedia, isLocalMediaUrl } from '@frontend/lib/local-media';
import { uploadImage } from '@frontend/lib/upload-image';
import type { Plan } from '@server/database/schemas/projects';
import { deleteImage } from '@server-actions/files/delete-image';

const RATIO = 16 / 9;

interface PlanFormProps {
    plan: Plan;
    setPlan: (plan: Plan) => void;
    onSubmit: (plan: Plan) => void;
    isLocalProject: boolean;
}

export const PlanForm = ({ plan, setPlan, onSubmit, isLocalProject }: PlanFormProps) => {
    const t = useExtracted('create.3-storyboard.edit.PlanForm');
    const commonT = useExtracted('common');

    const [isUploading, setIsUploading] = React.useState(false);
    const [newImageData, setNewImageData] = React.useState<Blob | null | undefined>(undefined); // null = delete image
    const newImageUrl = React.useMemo(() => {
        return newImageData ? URL.createObjectURL(newImageData) : null;
    }, [newImageData]);
    const [showChangeModal, setShowChangeModal] = React.useState(false);
    const [showCameraModal, setShowCameraModal] = React.useState(false);
    const [showDrawModal, setShowDrawModal] = React.useState(false);
    const [isCreatingBlob, setIsCreatingBlob] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    const [imageToResizeUrl, setImageToResizeUrl] = React.useState<string | null>(null);
    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setImageToResizeUrl(URL.createObjectURL(event.target.files[0]));
            setShowChangeModal(false);
        } else {
            setImageToResizeUrl(null);
            setShowChangeModal(false);
        }
        event.target.value = ''; // clear input
    };

    const imageUrl = newImageData === null ? '' : newImageUrl || plan.imageUrl;

    const onNext = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsUploading(true);
        const planToSubmit = { ...plan };

        // Remove old image if needed.
        if (newImageData !== undefined && plan.imageUrl) {
            try {
                if (isLocalMediaUrl(plan.imageUrl)) {
                    await deleteLocalMedia(plan.imageUrl);
                } else {
                    await deleteImage(plan.imageUrl);
                }
            } catch {
                // Ignore
            }
            planToSubmit.imageUrl = '';
        }

        // Upload image if needed.
        if (newImageData) {
            try {
                planToSubmit.imageUrl = isLocalProject ? await insertLocalMedia(newImageData, { kind: 'image' }) : await uploadImage(newImageData);
            } catch (error) {
                console.error(error);
                sendToast({
                    message: commonT("Une erreur est survenue lors de l'importation de l'image."),
                    type: 'error',
                });
                setIsUploading(false);
                return;
            }
        }

        onSubmit(planToSubmit);
        setIsUploading(false);
    };

    return (
        <Form onSubmit={onNext}>
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start">
                <div className={`pill ${plan.description ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <LightningBoltIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t('Description du plan :')}
                    </Title>
                </FlexItem>
            </Flex>
            <Field
                name="plan_description"
                input={
                    <TextArea
                        value={plan.description}
                        onChange={(event) => {
                            setPlan({ ...plan, description: event.target.value.slice(0, 2000) });
                        }}
                        placeholder={t(
                            "Ici, vous pouvez décrire comment vous allez filmer ce plan.\nPar exemple :\n\tQUI ? quels élèves sont impliqués dans le tournage de ce plan ?\n\tCOMMENT ? Comment sont répartis les rôles entre élèves ? (qui tient la caméra, qui surveille le cadre, qui apparaît à l'écran ?)\n\tQUOI ? Que vont faire ou dire vos élèves ?\n\tQUAND ? À quelle date vous allez filmer ce plan ?\n\tOÙ ? Dans quel lieu allez-vous tourner ce plan ?",
                        )}
                        isFullWidth
                        rows={7}
                        color="secondary"
                        autoComplete="off"
                    />
                }
                helperText={`${plan.description.length}/2000`}
            ></Field>

            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ margin: '1rem 0 0 0' }}>
                <div className={`pill ${imageUrl ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <ImageIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2">
                        {t('Dessin du plan :')}
                    </Title>
                </FlexItem>
            </Flex>
            <Title color="inherit" variant="h3" className="for-tablet-up-only">
                {t("Pour créer votre plan vous pouvez soit l'importer, soit le prendre en photo ou le dessiner en ligne !")}
            </Title>
            <Title color="inherit" variant="h3" className="for-mobile-only">
                {t("Pour créer votre plan vous pouvez l'importer ou le prendre en photo !")}
            </Title>
            <div style={{ width: '100%', maxWidth: '600px', margin: '2rem auto' }}>
                <KeepRatio
                    ratio={1 / RATIO}
                    style={{
                        border: '1px solid rgb(192, 192, 192)',
                        borderRadius: '4px',
                        backgroundColor: imageUrl ? 'black' : 'unset',
                        overflow: 'hidden',
                    }}
                >
                    {imageUrl ? (
                        <Image unoptimized layout="fill" objectFit="contain" src={imageUrl} alt="Plan" />
                    ) : (
                        <EditImageButtons
                            imageUploadId="plan-img-upload"
                            onShowCamera={() => {
                                setShowCameraModal(true);
                            }}
                            onDraw={() => {
                                setShowDrawModal(true);
                            }}
                        />
                    )}
                </KeepRatio>
                <input id="plan-img-upload" type="file" accept="image/*" onChange={onInputUpload} style={{ display: 'none' }} />
                {imageUrl && (
                    <div className="text-center">
                        <Button
                            label={t('Changer le dessin')}
                            className="plan-button"
                            variant="outlined"
                            color="secondary"
                            style={{ display: 'inline-block' }}
                            onClick={() => {
                                setShowChangeModal(true);
                            }}
                            marginTop="md"
                        ></Button>
                        <Button
                            label={commonT('Supprimer')}
                            className="plan-button"
                            variant="outlined"
                            color="secondary"
                            style={{ display: 'inline-block' }}
                            onClick={() => {
                                setNewImageData(null);
                            }}
                            marginTop="md"
                            marginLeft="md"
                        ></Button>
                        <Modal
                            isOpen={showChangeModal}
                            onClose={() => {
                                setShowChangeModal(false);
                            }}
                            title={t('Changer le dessin du plan')}
                            isFullWidth
                        >
                            <EditImageButtons
                                imageUploadId="plan-img-upload"
                                onShowCamera={() => {
                                    setShowChangeModal(false);
                                    setShowCameraModal(true);
                                }}
                                onDraw={() => {
                                    setShowChangeModal(false);
                                    setShowDrawModal(true);
                                }}
                            />
                        </Modal>
                    </div>
                )}
            </div>

            <Cropper
                ratio={RATIO}
                imageUrl={imageToResizeUrl || ''}
                isOpen={imageToResizeUrl !== null}
                onClose={() => {
                    setImageToResizeUrl(null);
                }}
                onCrop={(data) => {
                    setNewImageData(data);
                    setImageToResizeUrl(null);
                }}
            />

            <Modal
                width="lg"
                isOpen={showCameraModal}
                onClose={() => {
                    setShowCameraModal(false);
                }}
                title={t('Prendre une photo')}
                isFullWidth
            >
                <div style={{ maxWidth: '120vh', margin: '0 auto' }}>
                    <Camera
                        idealResolution={{ width: 1920, height: 1080 }}
                        onTakePhoto={(picture: string) => {
                            setShowCameraModal(false);
                            setImageToResizeUrl(picture);
                        }}
                        isSilentMode={true}
                    />
                </div>
            </Modal>

            <Modal
                width="lg"
                isOpen={showDrawModal}
                isLoading={isCreatingBlob}
                onClose={() => {
                    setShowDrawModal(false);
                }}
                confirmLabel={t('Enregistrer')}
                confirmLevel="secondary"
                onConfirm={async () => {
                    setIsCreatingBlob(true);
                    const canvas = canvasRef.current;
                    let blob: Blob | null = null;
                    if (canvas) {
                        blob = await new Promise<Blob | null>((resolve) => {
                            const canvasWithBackground = document.createElement('canvas');
                            canvasWithBackground.width = canvas.width;
                            canvasWithBackground.height = canvas.height;

                            const ctx = canvasWithBackground.getContext('2d');
                            if (!ctx) {
                                resolve(null);
                                return;
                            }
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(canvas, 0, 0);
                            canvasWithBackground.toBlob(resolve);
                        });
                    }
                    if (blob !== null) {
                        setNewImageData(blob);
                    } else {
                        sendToast({ message: commonT('Une erreur est survenue...'), type: 'error' });
                    }
                    setIsCreatingBlob(false);
                    setShowDrawModal(false);
                }}
                title={t('Dessiner le plan')}
                isFullWidth
                onOpenAutoFocus={false}
            >
                <Canvas ref={canvasRef} />
            </Modal>

            <NextButton label={commonT('Continuer')} backHref="/create/3-storyboard" type="submit" />

            <Loader isLoading={isUploading} />
        </Form>
    );
};

const SecondaryColor = '#79C3A5';

const styles: Record<string, React.CSSProperties> = {
    verticalLine: {
        backgroundColor: SecondaryColor,
        flex: 1,
        width: '1px',
        margin: '0.2rem 0',
    },
    horizontalLine: {
        backgroundColor: SecondaryColor,
        flex: 1,
        height: '1px',
        margin: '2rem 1rem',
    },
    secondaryColor: {
        color: SecondaryColor,
    },
};

type EditImageButtonsProps = {
    imageUploadId: string;
    onShowCamera(): void;
    onDraw(): void;
};
const EditImageButtons = ({ imageUploadId, onShowCamera, onDraw }: EditImageButtonsProps) => {
    const t = useExtracted('create.3-storyboard.edit.PlanForm');
    const commonT = useExtracted('common');

    return (
        <div className="edit-plans-container">
            <Button
                variant="outlined"
                color="secondary"
                as="label"
                label={t('Importer une image')}
                htmlFor={imageUploadId}
                isUpperCase={false}
                role="button"
                aria-controls="filename"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        document.getElementById(imageUploadId)?.click();
                    }
                }}
                leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            ></Button>
            <div className="or-horizontal-divider">
                <div style={styles.verticalLine} />
                <span style={styles.secondaryColor}>{commonT('ou').toUpperCase()}</span>
                <div style={styles.verticalLine} />
            </div>
            <Button
                label={t('Prendre une photo')}
                variant="outlined"
                color="secondary"
                isUpperCase={false}
                onClick={onShowCamera}
                leftIcon={<CameraIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            ></Button>
            <div className="or-horizontal-divider for-tablet-up">
                <div style={styles.verticalLine} />
                <span style={styles.secondaryColor}>{commonT('ou').toUpperCase()}</span>
                <div style={styles.verticalLine} />
            </div>
            <Button
                label={t('Dessiner le plan')}
                variant="outlined"
                color="secondary"
                isUpperCase={false}
                isTabletUpOnly
                leftIcon={<Pencil2Icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                onClick={onDraw}
            ></Button>
        </div>
    );
};
