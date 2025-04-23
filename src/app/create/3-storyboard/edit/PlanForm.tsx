import { CameraIcon, ImageIcon, LightningBoltIcon, Pencil2Icon, UploadIcon } from '@radix-ui/react-icons';
import Image from 'next/legacy/image';
import React from 'react';
import Camera from 'react-html5-camera-photo';

import { deleteImage } from 'src/actions/files/delete-image';
import { uploadImage } from 'src/actions/files/upload-image';
import { Canvas } from 'src/components/create/Canvas';
import { Button } from 'src/components/layout/Button';
import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Field, Form, TextArea } from 'src/components/layout/Form';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Cropper } from 'src/components/ui/Cropper';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';
import type { Plan } from 'src/database/schemas/projects';

const RATIO = 16 / 9;

interface PlanFormProps {
    plan: Plan;
    setPlan: (plan: Plan) => void;
    onSubmit: (plan: Plan) => void;
}

export const PlanForm = ({ plan, setPlan, onSubmit }: PlanFormProps) => {
    const { t } = useTranslation();

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
                await deleteImage(plan.imageUrl);
            } catch {
                // Ignore
            }
            planToSubmit.imageUrl = '';
        }

        // Upload image if needed.
        if (newImageData) {
            try {
                planToSubmit.imageUrl = await uploadImage(newImageData);
            } catch (error) {
                console.error(error);
                sendToast({
                    message: t('error_upload_image'),
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
                        {t('part3_plan_desc')}
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
                        placeholder={t('part3_plan_desc_placeholder')}
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
                        {t('part3_plan_image')}
                    </Title>
                </FlexItem>
            </Flex>
            <Title color="inherit" variant="h3" className="for-tablet-up-only">
                {t('part3_plan_edit_title_desktop')}
            </Title>
            <Title color="inherit" variant="h3" className="for-mobile-only">
                {t('part3_plan_edit_title_mobile')}
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
                        <Image unoptimized layout="fill" objectFit="contain" src={imageUrl} />
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
                            label={t('part3_change_image')}
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
                            label={t('delete')}
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
                            title={t('part3_change_image')}
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
                title={t('take_picture')}
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
                confirmLabel={t('save')}
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
                        sendToast({ message: t('unknown_error'), type: 'error' });
                    }
                    setIsCreatingBlob(false);
                    setShowDrawModal(false);
                }}
                title={t('draw_plan')}
                isFullWidth
                onOpenAutoFocus={false}
            >
                <Canvas ref={canvasRef} />
            </Modal>

            <NextButton label={t('continue')} backHref="/create/3-storyboard" type="submit" />

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
    const { t } = useTranslation();

    return (
        <div className="edit-plans-container">
            <Button
                variant="outlined"
                color="secondary"
                as="label"
                label={t('import_image')}
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
                <span style={styles.secondaryColor}>{t('or').toUpperCase()}</span>
                <div style={styles.verticalLine} />
            </div>
            <Button
                label={t('take_picture')}
                variant="outlined"
                color="secondary"
                isUpperCase={false}
                onClick={onShowCamera}
                leftIcon={<CameraIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            ></Button>
            <div className="or-horizontal-divider for-tablet-up">
                <div style={styles.verticalLine} />
                <span style={styles.secondaryColor}>{t('or').toUpperCase()}</span>
                <div style={styles.verticalLine} />
            </div>
            <Button
                label={t('draw_plan')}
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
