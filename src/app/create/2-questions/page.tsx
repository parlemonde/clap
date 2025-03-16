'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { QuestionsList } from './QuestionsList';
import { createProject } from 'src/actions/projects/create-project';
import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Flex } from 'src/components/layout/Flex';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';
import { NextButton } from 'src/components/navigation/NextButton';
import { Steps } from 'src/components/navigation/Steps';
import { ThemeBreadcrumbs } from 'src/components/navigation/ThemeBreadcrumbs';
import { Inverted } from 'src/components/ui/Inverted';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import { userContext } from 'src/contexts/userContext';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { deleteFromLocalStorage } from 'src/hooks/useLocalStorage/local-storage';

export default function QuestionPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = React.useContext(userContext);
    const [projectId, setProjectId] = useLocalStorage('projectId');
    const { project, setProject } = useCurrentProject();
    const { collaborationButton } = useCollaboration();
    const [title, setTitle] = React.useState('');
    const [showSaveProjectModal, setShowSaveProjectModal] = React.useState(false);
    const [isCreatingProject, setIsCreatingProject] = React.useState(false);

    if (!project || user?.role === 'student') {
        return null;
    }

    const onSaveProject = async () => {
        if (!project) {
            return;
        }
        // Fix from legacy local project having  an id.
        if ('id' in project) {
            delete project.id;
        }
        setIsCreatingProject(true);
        const backendProject = await createProject({
            ...project,
            name: title,
            themeId: typeof project.themeId === 'string' ? null : project.themeId,
            scenarioId: typeof project.scenarioId === 'string' ? null : project.scenarioId,
        });
        setIsCreatingProject(false);
        if (backendProject) {
            setProjectId(backendProject.id);
            deleteFromLocalStorage('project');
            router.push('/create/3-storyboard');
        } else {
            sendToast({
                message: t('unknown_error'),
                type: 'error',
            });
        }
    };

    return (
        <Container paddingBottom="xl">
            <ThemeBreadcrumbs themeId={project.themeId}></ThemeBreadcrumbs>
            <Steps activeStep={1} themeId={project.themeId}></Steps>
            <Flex flexDirection="row" alignItems="center" marginY="md">
                <Title color="primary" variant="h1" marginRight="xl">
                    <Inverted isRound>2</Inverted>{' '}
                    <Trans i18nKey="part2_title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Title>
                {collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2" marginBottom="lg">
                {t('part2_desc')}
            </Title>
            <Link href={`/create/2-questions/new`} passHref legacyBehavior>
                <Button as="a" label={t('add_question')} variant="outlined" color="secondary" isUpperCase={false}></Button>
            </Link>
            <QuestionsList project={project} setProject={setProject} />
            <NextButton
                onNext={() => {
                    if (!projectId && project && user) {
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
                title={t('project_save_title')}
                cancelLabel={t('project_save_cancel')}
                confirmLabel={t('project_save_confirm')}
                confirmLevel="secondary"
                isConfirmDisabled={title.length === 0}
                isLoading={isCreatingProject}
            >
                <div id="save-project-form">
                    <p>{t('project_save_desc')}</p>
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
                            label={t('project_save_label')}
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
