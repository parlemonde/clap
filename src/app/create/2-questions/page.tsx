'use client';

import { useRouter } from 'next/navigation';
import { useExtracted, useLocale } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { LinearProgress } from '@frontend/components/layout/LinearProgress';
import { Modal } from '@frontend/components/layout/Modal';
import { Text, Title } from '@frontend/components/layout/Typography';
import { NextButton } from '@frontend/components/navigation/NextButton';
import { Steps } from '@frontend/components/navigation/Steps';
import { ThemeBreadcrumbs } from '@frontend/components/navigation/ThemeBreadcrumbs';
import { Inverted } from '@frontend/components/ui/Inverted';
import { sendToast } from '@frontend/components/ui/Toasts';
import { userContext } from '@frontend/contexts/userContext';
import { useCollaboration } from '@frontend/hooks/useCollaboration';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { deleteFromLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import {
    collectProjectMediaUrls,
    deleteLocalMedia,
    isLocalMediaUrl,
    LocalMediaMigrationError,
    migrateLocalProjectMedia,
} from '@frontend/lib/local-media';
import { deleteImage } from '@server-actions/files/delete-image';
import { deleteSound } from '@server-actions/files/delete-sound';
import { createProject } from '@server-actions/projects/create-project';

import { QuestionsList } from './QuestionsList';

type SaveProjectProgress =
    | {
          status: 'idle';
          completed: number;
          total: number;
      }
    | {
          status: 'uploading' | 'saving';
          completed: number;
          total: number;
      };

function LinearProgressWithLabel({ value }: { value: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', marginRight: 16 }}>
                <LinearProgress value={value} color="secondary" />
            </div>
            <div style={{ minWidth: 35 }}>
                <Text className="color-secondary">{`${Math.round(value)}%`}</Text>
            </div>
        </div>
    );
}

function getSaveProjectProgressValue(progress: SaveProjectProgress): number {
    if (progress.status === 'idle') {
        return 0;
    }
    if (progress.status === 'saving') {
        return 100;
    }
    if (progress.total === 0) {
        return 0;
    }
    return (progress.completed / progress.total) * 90;
}

async function deleteUploadedMedia(url: string): Promise<void> {
    if (url.startsWith('/media/images/')) {
        await deleteImage(url);
    } else if (url.startsWith('/media/audios/')) {
        await deleteSound(url);
    }
}

export default function QuestionPage() {
    const router = useRouter();
    const t = useExtracted('create.2-questions');
    const commonT = useExtracted('common');
    const currentLocale = useLocale();
    const user = React.useContext(userContext);
    const [projectId, setProjectId] = useLocalStorage('projectId');
    const { projectData, setProjectData } = useCurrentProject();
    const { collaborationButton } = useCollaboration();
    const [title, setTitle] = React.useState('');
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);
    const [isCreatingProject, setIsCreatingProject] = React.useState(false);
    const [saveProjectProgress, setSaveProjectProgress] = React.useState<SaveProjectProgress>({
        status: 'idle',
        completed: 0,
        total: 0,
    });

    if (!projectData || user?.role === 'student') {
        return null;
    }

    const onSaveProject = async () => {
        if (!projectData) {
            return;
        }
        const newProjectData = { ...projectData };
        // Fix from legacy local project having  an id.
        if ('id' in newProjectData) {
            delete newProjectData.id;
            setProjectData(newProjectData);
        }
        setIsCreatingProject(true);
        setSaveProjectProgress({ status: 'uploading', completed: 0, total: 0 });
        let uploadedUrls: string[] = [];
        try {
            const migratedProject = await migrateLocalProjectMedia(newProjectData, (progress) => {
                setSaveProjectProgress({ status: 'uploading', ...progress });
            });
            uploadedUrls = migratedProject.uploadedUrls;
            setSaveProjectProgress({ status: 'saving', completed: uploadedUrls.length, total: uploadedUrls.length });
            const backendProject = await createProject({
                data: migratedProject.projectData,
                name: title,
                language: currentLocale,
                themeId: typeof migratedProject.projectData.themeId === 'string' ? null : migratedProject.projectData.themeId,
                scenarioId: typeof migratedProject.projectData.scenarioId === 'string' ? null : migratedProject.projectData.scenarioId,
            });
            if (!backendProject) {
                throw new Error('Project creation failed.');
            }
            setProjectId(backendProject.id);
            deleteFromLocalStorage('project');
            await Promise.all(
                [...collectProjectMediaUrls(newProjectData)].filter(isLocalMediaUrl).map(async (url) => {
                    try {
                        await deleteLocalMedia(url);
                    } catch {
                        // Ignore cleanup failures after a successful save.
                    }
                }),
            );
            router.push('/create/3-storyboard');
        } catch (error) {
            console.error(error);
            const urlsToDelete = error instanceof LocalMediaMigrationError ? error.uploadedUrls : uploadedUrls;
            await Promise.all(
                urlsToDelete.map(async (url) => {
                    try {
                        await deleteUploadedMedia(url);
                    } catch {
                        // Ignore best-effort remote cleanup errors.
                    }
                }),
            );
            sendToast({
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
            setIsCreatingProject(false);
            setSaveProjectProgress({ status: 'idle', completed: 0, total: 0 });
        }
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={projectData.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>2</Inverted>{' '}
                    {t.rich('Mes <inverted>séquences</inverted>', {
                        inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                    })}
                </Title>
                {collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2" marginBottom="lg">
                {t('Pour structurer votre scénario, nous vous proposons de le découper en séquences. Souvent une séquence correspond à une idée.')}
            </Title>
            <Button
                as="a"
                href={`/create/2-questions/new`}
                label={t('Ajouter une séquence')}
                variant="outlined"
                color="secondary"
                isUpperCase={false}
            ></Button>
            <QuestionsList project={projectData} setProject={setProjectData} />
            <NextButton
                onNext={() => {
                    if (!projectId && projectData && user) {
                        setShowSaveProjectModal(true);
                    } else {
                        router.push('/create/3-storyboard');
                    }
                }}
            />
            <Modal
                isOpen={showSaveProjectModal}
                onClose={() => {
                    if (isCreatingProject) {
                        return;
                    }
                    setShowSaveProjectModal(false);
                    router.push('/create/3-storyboard');
                }}
                onConfirm={isCreatingProject ? undefined : onSaveProject}
                hasCloseButton={false}
                hasCancelButton={!isCreatingProject}
                title={t('Sauvegarder le projet ?')}
                cancelLabel={t('Ne pas sauvegarder')}
                confirmLabel={t('Sauvegarder le projet')}
                confirmLevel="secondary"
                isConfirmDisabled={title.length === 0}
            >
                {isCreatingProject ? (
                    <div>
                        <Text className="color-secondary" style={{ fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>
                            {saveProjectProgress.status === 'saving' ? t('Sauvegarde du projet...') : t('Importation des médias du projet...')}
                        </Text>
                        <LinearProgressWithLabel value={getSaveProjectProgressValue(saveProjectProgress)} />
                        <Text marginTop="md" style={{ display: 'inline-block' }}>
                            {t('Veuillez garder cette page ouverte jusqu’à la fin de la sauvegarde.')}
                        </Text>
                    </div>
                ) : (
                    <div id="save-project-form">
                        <p>
                            {t(
                                'Enregistrer le projet vous permettra de le retrouver dans l\'onglet "Mes vidéos" et également dans l\'application Par Le Monde.',
                            )}
                        </p>
                        <Form
                            className="project-form"
                            noValidate
                            autoComplete="off"
                            marginY="lg"
                            onSubmit={(event) => {
                                event.preventDefault();
                                onSaveProject().catch(() => {});
                            }}
                        >
                            <Field
                                name="project-name"
                                label={t('Nom du projet :')}
                                input={
                                    <Input
                                        id="project-name"
                                        name="project-name"
                                        type="text"
                                        color="secondary"
                                        value={title}
                                        onChange={(event) => {
                                            setTitle(event.target.value.slice(0, 200));
                                        }}
                                        size="sm"
                                        isFullWidth
                                    />
                                }
                                helperText={`${title.length}/200`}
                            ></Field>
                        </Form>
                    </div>
                )}
            </Modal>
        </Container>
    );
}
