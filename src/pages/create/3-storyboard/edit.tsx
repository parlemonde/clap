import { LightningBoltIcon, ImageIcon, CameraIcon, UploadIcon, Pencil2Icon } from '@radix-ui/react-icons';
import Image from 'next/legacy/image';
import { useRouter } from 'next/router';
import React from 'react';
import Camera from 'react-html5-camera-photo';

import { useDeleteImageMutation } from 'src/api/images/images.delete';
import { useCreateImageMutation } from 'src/api/images/images.post';
import { useUpdatePlanMutation } from 'src/api/plans/plans.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { ButtonShowFeedback } from 'src/components/collaboration/ButtonShowFeedback';
import { FeedbackModal } from 'src/components/collaboration/FeedbackModal';
import { Canvas } from 'src/components/create/Canvas';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Field, Form, TextArea } from 'src/components/layout/Form';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import type { ImgCroppieRef } from 'src/components/ui/ImgCroppie';
import { ImgCroppie } from 'src/components/ui/ImgCroppie';
import { Inverted } from 'src/components/ui/Inverted';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import { isString } from 'src/utils/type-guards/is-string';
import { useQueryNumber } from 'src/utils/useQueryId';
import { QuestionStatus } from 'types/models/question.type';
import { UserType } from 'types/models/user.type';

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
                onKeyPress={(event) => {
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

const EditPlan = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { project, questions, isLoading: isProjectLoading, updateProject } = useCurrentProject();
    const { theme, isLoading: isThemeLoading } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { isCollaborationActive } = useCollaboration();
    const { socket, connectStudent, connectTeacher, updateProject: updateProjectSocket } = useSocket();

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
    const { user } = React.useContext(userContext);
    const isStudent = user?.type === UserType.STUDENT;
    const [showButtonFeedback, setShowButtonFeedback] = React.useState(isStudent && sequence && sequence.feedback);
    const [showFeedback, setShowFeedback] = React.useState(false);
    const imageUrl = React.useMemo(() => {
        if (imageBlob !== null) {
            return URL.createObjectURL(imageBlob);
        }
        return plan && isString(plan.imageUrl) ? plan.imageUrl : '';
    }, [imageBlob, plan]);

    React.useEffect(() => {
        if (isStudent && sequence && sequence.feedback) {
            setShowButtonFeedback(true);
        }
    }, [isStudent, sequence]);

    React.useEffect(() => {
        if (!plan) {
            return;
        }
        setDescription(plan.description || '');
    }, [plan]);

    React.useEffect(() => {
        if (isCollaborationActive && socket.connected === false && project !== undefined && project.id && questionIndex !== -1) {
            if (isStudent) {
                connectStudent(project.id, questionIndex);
            } else if (!isStudent) {
                connectTeacher(project);
            }
        }
    }, [isCollaborationActive, socket, project, isStudent, questionIndex]);

    const backUrl = `/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`;

    React.useEffect(() => {
        if (isStudent && sequence && sequence.status !== QuestionStatus.ONGOING) {
            router.push(backUrl);
        }
        return;
    }, [sequence, isStudent, backUrl, router]);

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
            const updatedProject = updateProject({
                questions: newQuestions,
            });
            if (isCollaborationActive && updatedProject) {
                updateProjectSocket(updatedProject);
            }
            router.push(backUrl);
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    const isLoading = createImageMutation.isLoading || deleteImageMutation.isLoading || updatePlanMutation.isLoading;

    return (
        <Container>
            <ThemeBreadcrumbs theme={theme} isLoading={isThemeLoading}></ThemeBreadcrumbs>
            <Steps
                activeStep={2}
                themeId={project ? project.themeId : undefined}
                scenarioName={scenario?.names?.[currentLocale] || undefined}
                backHref={backUrl}
            ></Steps>
            <div style={{ maxWidth: '1000px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="primary" variant="h1" marginY="md">
                    <Inverted isRound>3</Inverted> {t('part3_edit_plan')}
                    {showButtonFeedback && <ButtonShowFeedback onClick={() => setShowFeedback(true)} />}
                </Title>
                <Title color="inherit" variant="h2">
                    <span>{t('part3_question')}</span> {sequence?.question || ''}
                </Title>
                <Title color="inherit" variant="h2" marginY="md">
                    <span>{t('part3_plan_number')}</span> {planStartIndex + planIndex}
                </Title>

                <Form onSubmit={onSubmit}>
                    {plan !== undefined && (
                        <>
                            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start">
                                <div className={`pill ${description ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
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
                                        value={description}
                                        onChange={(event) => {
                                            setDescription(event.target.value.slice(0, 2000));
                                        }}
                                        placeholder={t('part3_plan_desc_placeholder')}
                                        isFullWidth
                                        rows={7}
                                        color="secondary"
                                        autoComplete="off"
                                    />
                                }
                                helperText={`${description.length}/2000`}
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
                                    ratio={9 / 16}
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
                            </div>
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
                                            setTemporaryImageUrl(picture);
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
                                        setImageBlob(blob);
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

                            {/* image modal */}
                            <Modal
                                width="lg"
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
                    <NextButton backHref={backUrl} label={t('continue')} type="submit" />
                </Form>
            </div>
            <Loader isLoading={isLoading} />
            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                feedback={sequence && sequence.feedback ? sequence.feedback : ''}
            />
        </Container>
    );
};

export default EditPlan;
