import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';
import Camera from 'react-html5-camera-photo';

import BoltIcon from '@mui/icons-material/Bolt';
import CreateIcon from '@mui/icons-material/Create';
import LandscapeIcon from '@mui/icons-material/Landscape';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/Upload';
import { Typography, TextField, FormHelperText, Box, Button } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { useDeleteImageMutation } from 'src/api/images/images.delete';
import { useCreateImageMutation } from 'src/api/images/images.post';
import { useUpdatePlanMutation } from 'src/api/plans/plans.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { Canvas } from 'src/components/Canvas';
import type { ImgCroppieRef } from 'src/components/ImgCroppie';
import { ImgCroppie } from 'src/components/ImgCroppie';
import { Flex } from 'src/components/layout/Flex';
import { FlexItem } from 'src/components/layout/FlexItem';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Loader } from 'src/components/layout/Loader';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import Modal from 'src/components/ui/Modal';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { isString } from 'src/utils/type-guards/is-string';
import { useQueryNumber } from 'src/utils/useQueryId';

const styles = {
    verticalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        width: '1px',
        margin: '0.2rem 0',
    },
    horizontalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        height: '1px',
        margin: '2rem 1rem',
    },
    secondaryColor: {
        color: (theme: MaterialTheme) => theme.palette.secondary.main,
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
        <Box className="edit-plans-container">
            <Button
                variant="outlined"
                color="secondary"
                component="label"
                htmlFor={imageUploadId}
                style={{ textTransform: 'none' }}
                startIcon={<CloudUploadIcon />}
            >
                {t('import_image')}
            </Button>
            <div className="or-horizontal-divider">
                <Box sx={styles.verticalLine} />
                <Box component="span" sx={styles.secondaryColor}>
                    {t('or').toUpperCase()}
                </Box>
                <Box sx={styles.verticalLine} />
            </div>
            <Button variant="outlined" color="secondary" style={{ textTransform: 'none' }} onClick={onShowCamera} startIcon={<PhotoCameraIcon />}>
                {t('take_picture')}
            </Button>
            <Box className="or-horizontal-divider" sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Box sx={styles.verticalLine} />
                <Box component="span" sx={styles.secondaryColor}>
                    {t('or').toUpperCase()}
                </Box>
                <Box sx={styles.verticalLine} />
            </Box>
            <Button
                variant="outlined"
                color="secondary"
                sx={{ textTransform: 'none', display: { xs: 'none', md: 'inline-flex' } }}
                startIcon={<CreateIcon />}
                onClick={onDraw}
            >
                {t('draw_plan')}
            </Button>
        </Box>
    );
};

const EditPlan = () => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const questionIndex = useQueryNumber('question') ?? -1;
    const planIndex = useQueryNumber('plan') ?? -1;
    const planStartIndex = React.useMemo(
        () => questions.slice(0, questionIndex).reduce<number>((acc, question) => acc + (question.plans || []).length, 1),
        [questions, questionIndex],
    );

    const sequence = React.useMemo(() => (questionIndex !== -1 ? questions[questionIndex] : undefined), [questions, questionIndex]);
    const plan = React.useMemo(() => (sequence && planIndex !== -1 ? (sequence.plans || [])[planIndex] : undefined), [sequence, planIndex]);

    // --- local image variables ---
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const croppieRef = React.useRef<ImgCroppieRef | null>(null);
    const [isCreatingBlob, setIsCreatingBlob] = React.useState(false);
    const [showChangeModal, setShowChangeModal] = React.useState(false);
    const [showCameraModal, setShowCameraModal] = React.useState(false);
    const [showDrawModal, setShowDrawModal] = React.useState(false);
    const [description, setDescription] = React.useState(plan?.description || '');
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const [temporaryImageUrl, setTemporaryImageUrl] = React.useState<string | null>(null);
    const imageUrl = React.useMemo(() => {
        if (imageBlob !== null) {
            return URL.createObjectURL(imageBlob);
        }
        return plan && isString(plan.imageUrl) ? plan.imageUrl : '';
    }, [imageBlob, plan]);

    React.useEffect(() => {
        if (!plan) {
            return;
        }
        setDescription(plan.description || '');
    }, [plan]);

    const onInputUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            setTemporaryImageUrl(URL.createObjectURL(event.target.files[0]));
        }
        event.target.value = ''; // clear input
        setShowChangeModal(false);
    };

    // --- Update plan ---
    const createImageMutation = useCreateImageMutation();
    const deleteImageMutation = useDeleteImageMutation();
    const updatePlanMutation = useUpdatePlanMutation();
    const backUrl = `/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`;

    const onSubmit = async () => {
        if (!project || !plan) {
            return;
        }
        // [1] delete previous image if any.
        if (imageBlob !== null && plan.imageUrl && isString(plan.imageUrl) && plan.imageUrl.startsWith('/api/images')) {
            try {
                await deleteImageMutation.mutateAsync({ imageUrl: plan.imageUrl });
            } catch (err) {
                // ignore delete error
                console.error(err);
            }
        }

        try {
            // [2] upload new image if any.
            let newImageUrl = plan.imageUrl;
            if (imageBlob !== null) {
                const imageResponse = await createImageMutation.mutateAsync({ image: imageBlob });
                newImageUrl = imageResponse.url;
            }

            // [3] update plan data.
            if (project.id !== 0) {
                await updatePlanMutation.mutateAsync({
                    planId: plan.id,
                    imageUrl: newImageUrl,
                    description,
                });
            }

            // [4] update project.
            const newPlans = [...(sequence?.plans || [])];
            newPlans[planIndex] = {
                ...plan,
                imageUrl: newImageUrl,
                description,
            };
            const newQuestions = [...questions];
            newQuestions[questionIndex] = {
                ...newQuestions[questionIndex],
                plans: newPlans,
            };
            updateProject({
                questions: newQuestions,
            });
            router.push(backUrl);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    const isLoading = createImageMutation.isLoading || deleteImageMutation.isLoading || updatePlanMutation.isLoading;

    return (
        <div>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
                backHref={backUrl}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography color="primary" variant="h1">
                    <Inverted round>3</Inverted> {t('part3_edit_plan')}
                </Typography>
                <Typography variant="h2">
                    <span>{t('part3_question')}</span> {sequence?.question || ''}
                </Typography>
                <Typography variant="h2">
                    <span>{t('part3_plan_number')}</span> {planStartIndex + planIndex}
                </Typography>

                {plan !== undefined && (
                    <>
                        <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start">
                            <div className={`bolt ${description ? 'green' : ''}`} style={{ marginRight: '10px' }}>
                                <BoltIcon />
                            </div>
                            <FlexItem flexGrow={1} flexBasis={0}>
                                <Typography color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                                    {t('part3_plan_desc')}
                                </Typography>
                            </FlexItem>
                        </Flex>
                        <TextField
                            value={description}
                            onChange={(event) => {
                                setDescription(event.target.value.slice(0, 2000));
                            }}
                            required
                            multiline
                            placeholder={t('part3_plan_desc_placeholder')}
                            fullWidth
                            minRows={7}
                            variant="outlined"
                            color="secondary"
                            autoComplete="off"
                        />
                        <FormHelperText id="component-helper-text" style={{ marginLeft: '0.2rem', marginTop: '0.2rem' }}>
                            {plan.description.length}/2000
                        </FormHelperText>

                        <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ margin: '1rem 0 0 0' }}>
                            <div className={`bolt ${imageUrl ? 'green' : ''}`} style={{ marginRight: '10px' }}>
                                <LandscapeIcon />
                            </div>
                            <FlexItem flexGrow={1} flexBasis={0}>
                                <Typography color="inherit" variant="h2">
                                    {t('part3_plan_image')}
                                </Typography>
                            </FlexItem>
                        </Flex>
                        <Typography color="inherit" variant="h3" sx={{ display: { xs: 'none', md: 'block' } }}>
                            {t('part3_plan_edit_title_desktop')}
                        </Typography>
                        <Typography color="inherit" variant="h3" sx={{ display: { xs: 'block', md: 'none' } }}>
                            {t('part3_plan_edit_title_mobile')}
                        </Typography>

                        <div style={{ width: '100%', maxWidth: '600px', margin: '2rem auto' }}>
                            <KeepRatio
                                ratio={9 / 16}
                                sx={{
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
                        </div>
                        <input id="plan-img-upload" type="file" accept="image/*" onChange={onInputUpload} style={{ display: 'none' }} />
                        {imageUrl && (
                            <div className="text-center">
                                <Button
                                    className="plan-button"
                                    variant="outlined"
                                    color="secondary"
                                    style={{ display: 'inline-block' }}
                                    onClick={() => {
                                        setShowChangeModal(true);
                                    }}
                                >
                                    {t('part3_change_image')}
                                </Button>
                                <Modal
                                    isOpen={showChangeModal}
                                    onClose={() => {
                                        setShowChangeModal(false);
                                    }}
                                    title={t('part3_change_image')}
                                    ariaLabelledBy="change_img"
                                    ariaDescribedBy="change_img_description"
                                    isFullWidth
                                >
                                    <EditImageButtons
                                        imageUploadId="plan-img-upload"
                                        onShowCamera={() => {
                                            setShowCameraModal(true);
                                            setShowChangeModal(false);
                                        }}
                                        onDraw={() => {
                                            setShowDrawModal(true);
                                            setShowChangeModal(false);
                                        }}
                                    />
                                </Modal>
                            </div>
                        )}
                        <Modal
                            isOpen={showCameraModal}
                            onClose={() => {
                                setShowCameraModal(false);
                            }}
                            title={t('take_picture')}
                            ariaLabelledBy="take_picture"
                            ariaDescribedBy="take_picture_description"
                            isFullWidth
                        >
                            <div style={{ maxWidth: '120vh', margin: '0 auto' }}>
                                <Camera
                                    idealResolution={{ width: 1920, height: 1080 }}
                                    onTakePhoto={(picture: string) => {
                                        setShowCameraModal(false);
                                        setTemporaryImageUrl(picture);
                                    }}
                                    isSilentMode={true}
                                />
                            </div>
                        </Modal>
                        <Modal
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
                                    setImageBlob(blob);
                                } else {
                                    enqueueSnackbar(t('unknown_error'), {
                                        variant: 'error',
                                    });
                                }
                                setIsCreatingBlob(false);
                                setShowDrawModal(false);
                            }}
                            title={t('draw_plan')}
                            ariaLabelledBy="draw_img"
                            ariaDescribedBy="draw_img_description"
                            isFullWidth
                        >
                            <Canvas ref={canvasRef} />
                        </Modal>

                        {/* image modal */}
                        <Modal
                            isOpen={temporaryImageUrl !== null}
                            onClose={() => {
                                setTemporaryImageUrl(null);
                            }}
                            onConfirm={async () => {
                                setIsCreatingBlob(true);
                                if (croppieRef.current) {
                                    setImageBlob(await croppieRef.current.getBlob());
                                }
                                setTemporaryImageUrl(null);
                                setIsCreatingBlob(false);
                            }}
                            isLoading={isCreatingBlob}
                            confirmLabel={t('validate')}
                            cancelLabel={t('cancel')}
                            title={t('part3_resize_image')}
                            ariaLabelledBy="add-dialog"
                            ariaDescribedBy="add-dialog-desc"
                            isFullWidth
                        >
                            {temporaryImageUrl !== null && (
                                <div className="text-center">
                                    <div style={{ display: 'inline-block', width: '640px', height: '360px', marginBottom: '2rem' }}>
                                        <ImgCroppie src={temporaryImageUrl} alt="Plan image" ref={croppieRef} imgWidth={560} imgHeight={315} />
                                    </div>
                                </div>
                            )}
                        </Modal>
                    </>
                )}

                <NextButton backHref={backUrl} label={t('continue')} onNext={onSubmit} />
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default EditPlan;
