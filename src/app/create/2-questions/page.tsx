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
    const { t, currentLocale } = useTranslation();
    const { user } = React.useContext(userContext);
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
        // Fix from legacy local project having  an id.
        if ('id' in projectData) {
            delete projectData.id;
        }
        setIsCreatingProject(true);
        const backendProject = await createProject({
            data: projectData,
            name: title,
            language: currentLocale,
            themeId: typeof projectData.themeId === 'string' ? null : projectData.themeId,
            scenarioId: typeof projectData.scenarioId === 'string' ? null : projectData.scenarioId,
        });
        setIsCreatingProject(false);
        if (backendProject) {
            setProjectId(backendProject.id);
            deleteFromLocalStorage('project');
            router.push('/create/3-storyboard');
        } else {
            sendToast({
                message: t('common.errors.unknown'),
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
                    <Trans i18nKey="2_questions_page.header.title">
                        Mes <Inverted>séquences</Inverted>
                    </Trans>
                </Title>
                {collaborationButton}
            </Flex>
            <Title color="inherit" variant="h2" marginBottom="lg">
                {t('2_questions_page.secondary.title')}
            </Title>
            <Link href={`/create/2-questions/new`} passHref legacyBehavior>
                <Button
                    as="a"
                    label={t('2_questions_page.add_question_button.label')}
                    variant="outlined"
                    color="secondary"
                    isUpperCase={false}
                ></Button>
            </Link>
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
                title={t('2_questions_page.save_project_modal.title')}
                cancelLabel={t('2_questions_page.save_project_modal.cancel')}
                confirmLabel={t('2_questions_page.save_project_modal.confirm')}
                confirmLevel="secondary"
                isConfirmDisabled={title.length === 0}
                isLoading={isCreatingProject}
            >
                <div id="save-project-form">
                    <p>{t('2_questions_page.save_project_modal.desc')}</p>
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
                            label={t('2_questions_page.save_project_name_field.label')}
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
