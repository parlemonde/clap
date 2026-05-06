'use client';

import { useRouter } from 'next/navigation';
import { useExtracted, useLocale } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Container } from '@frontend/components/layout/Container';
import { Flex } from '@frontend/components/layout/Flex';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { Title } from '@frontend/components/layout/Typography';
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
import { createProject } from '@server-actions/projects/create-project';

import { QuestionsList } from './QuestionsList';

export default function QuestionPage() {
    const router = useRouter();
    const tx = useExtracted('create.2-questions');
    const commonT = useExtracted('common');
    const currentLocale = useLocale();
    const user = React.useContext(userContext);
    const [projectId, setProjectId] = useLocalStorage('projectId');
    const { projectData, setProjectData } = useCurrentProject();
    const { collaborationButton } = useCollaboration();
    const [title, setTitle] = React.useState('');
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);
    const [isCreatingProject, setIsCreatingProject] = React.useState(false);

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
        const backendProject = await createProject({
            data: newProjectData,
            name: title,
            language: currentLocale,
            themeId: typeof newProjectData.themeId === 'string' ? null : newProjectData.themeId,
            scenarioId: typeof newProjectData.scenarioId === 'string' ? null : newProjectData.scenarioId,
        });
        setIsCreatingProject(false);
        if (backendProject) {
            setProjectId(backendProject.id);
            deleteFromLocalStorage('project');
            router.push('/create/3-storyboard');
        } else {
            sendToast({
                message: commonT('Une erreur est survenue...'),
                type: 'error',
            });
        }
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={projectData.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={projectData.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>2</Inverted>{' '}
                    {tx.rich('Mes <inverted>séquences</inverted>', {
                        inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                    })}
                </Title>
                {collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2" marginBottom="lg">
                {tx('Pour structurer votre scénario, nous vous proposons de le découper en séquences. Souvent une séquence correspond à une idée.')}
            </Title>
            <Button
                as="a"
                href={`/create/2-questions/new`}
                label={tx('Ajouter une séquence')}
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
                    setShowSaveProjectModal(false);
                    router.push('/create/3-storyboard');
                }}
                onConfirm={onSaveProject}
                hasCloseButton={false}
                title={tx('Sauvegarder le projet ?')}
                cancelLabel={tx('Ne pas sauvegarder')}
                confirmLabel={tx('Sauvegarder le projet')}
                confirmLevel="secondary"
                isConfirmDisabled={title.length === 0}
                isLoading={isCreatingProject}
            >
                <div id="save-project-form">
                    <p>
                        {tx(
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
                            label={tx('Nom du projet :')}
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
            </Modal>
        </Container>
    );
}
