import { InfoCircledIcon } from '@radix-ui/react-icons';
import { default as NextLink } from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeleteProjectMutation } from 'src/api/projects/projects.delete';
import { useProject } from 'src/api/projects/projects.get';
import { useUpdateProjectMutation } from 'src/api/projects/projects.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import { Button } from 'src/components/layout/Button';
import { Divider } from 'src/components/layout/Divider';
import { Flex } from 'src/components/layout/Flex';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { getQueryString } from 'src/utils/get-query-string';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const EditProject: React.FC = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { user } = React.useContext(userContext);
    const { project: localProject, updateProject } = useCurrentProject();

    const projectId = React.useMemo(() => Number(getQueryString(router.query.id)) || 0, [router]);
    const { project, isLoading: isProjectLoading } = useProject(projectId);
    const { theme } = useTheme(project ? project.themeId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });
    const { scenario } = useScenario(project ? project.scenarioId : 0, {
        enabled: !isProjectLoading && project !== undefined,
    });

    const [projectTitle, setProjectTitle] = React.useState<string>('');
    const [showTitleModal, setShowTitleModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    React.useEffect(() => {
        if (!user) {
            router.push('/create');
        }
    }, [router, user]);

    const updateProjectMutation = useUpdateProjectMutation();
    const onUpdateProject = async () => {
        if (project === undefined || projectTitle.length === 0) {
            return;
        }
        try {
            await updateProjectMutation.mutateAsync({
                projectId,
                title: projectTitle,
            });
            if (localProject && localProject.id === projectId) {
                updateProject({ title: projectTitle });
            }
            sendToast({ message: t('project_saved'), type: 'success' });
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
        setShowTitleModal(false);
    };

    const deleteProjectMutation = useDeleteProjectMutation();
    const onDeleteProject = async () => {
        try {
            await deleteProjectMutation.mutateAsync({ projectId });
            sendToast({ message: t('project_deleted'), type: 'success' });
            router.push('/my-videos');
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
        setShowDeleteModal(false);
    };

    if (!project) {
        return <div></div>;
    }

    return (
        <div>
            <div className="text-center" style={{ margin: '1rem 0' }}>
                <Title color="primary" variant="h1" style={{ display: 'inline' }}>
                    {t('project')}
                </Title>
                <Title color="inherit" variant="h1" style={{ display: 'inline' }} marginLeft="sm">
                    {project.title}
                </Title>
            </div>
            <div style={{ maxWidth: '800px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="inherit" variant="h2">
                    {t('project_details')}
                </Title>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>
                        <strong>{t('project_name')} : </strong>
                    </label>
                    {project.title} -{' '}
                    <a
                        tabIndex={0}
                        className="color-primary"
                        onKeyDown={(event) => {
                            if (event.key === ' ' || event.key === 'Enter') {
                                setProjectTitle(project.title);
                                setShowTitleModal(true);
                            }
                        }}
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => {
                            setProjectTitle(project.title);
                            setShowTitleModal(true);
                        }}
                    >
                        {t('account_change_button')}
                    </a>
                </div>
                {project.theme !== null && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ marginRight: '0.5rem' }}>
                            <strong>{t('pdf_theme')}</strong>
                        </label>
                        {theme?.names[currentLocale] || theme?.names.fr || ''}
                    </div>
                )}
                {project.scenario !== null && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ marginRight: '0.5rem' }}>
                            <strong>{t('pdf_scenario')}</strong>
                        </label>
                        {scenario?.names[currentLocale] || scenario?.names.fr || ''}
                    </div>
                )}
                {project.questions !== null && (
                    <>
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ marginRight: '0.5rem' }}>
                                <strong>{t('project_question_number')}</strong>
                            </label>
                            {project.questions?.length || 0}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ marginRight: '0.5rem' }}>
                                <strong>{t('project_plan_number')}</strong>
                            </label>
                            {project.questions?.reduce<number>((n, q) => n + (q.plans || []).length, 0) ?? 0}
                        </div>
                    </>
                )}
                <NextLink href={`/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`} passHref legacyBehavior>
                    <Button
                        label={t('project_see_plans')}
                        as="a"
                        marginTop="md"
                        className="mobile-full-width"
                        variant="contained"
                        color="secondary"
                        size="sm"
                    ></Button>
                </NextLink>
                <Divider marginY="md" />
                <Title color="inherit" variant="h2">
                    {t('project_delete')}
                </Title>
                <Button
                    label={t('project_delete')}
                    marginTop="md"
                    onClick={() => setShowDeleteModal(true)}
                    className="mobile-full-width"
                    variant="contained"
                    color="error"
                    size="sm"
                ></Button>
            </div>

            <Modal
                isOpen={showTitleModal}
                onClose={() => {
                    setShowTitleModal(false);
                }}
                onConfirm={onUpdateProject}
                confirmLabel={t('edit')}
                cancelLabel={t('cancel')}
                title={t('project_name')}
                isLoading={updateProjectMutation.isLoading}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="project-dialog-description">
                    <Field
                        name="description"
                        label={t('project_name')}
                        input={
                            <Input
                                name="description"
                                id="description"
                                isFullWidth
                                value={projectTitle}
                                placeholder={t('project_name')}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setProjectTitle(event.target.value.slice(0, 200));
                                }}
                                color="secondary"
                            />
                        }
                        helperText={`${projectTitle.length}/200`}
                    ></Field>
                </div>
            </Modal>
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={onDeleteProject}
                confirmLabel={t('delete')}
                confirmLevel="error"
                cancelLabel={t('cancel')}
                title={t('project_delete_title')}
                isLoading={deleteProjectMutation.isLoading}
                isFullWidth
            >
                <div id="delete-dialog-description">
                    <Flex
                        isFullWidth
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        marginBottom="md"
                        paddingX="md"
                        paddingY="sm"
                        style={{
                            backgroundColor: 'rgb(253, 237, 237)',
                            borderRadius: 4,
                            boxSizing: 'border-box',
                            fontSize: '14px',
                            color: 'rgb(95, 33, 32)',
                        }}
                    >
                        <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                        <Trans i18nKey="project_delete_desc1" i18nParams={{ projectTitle: project.title }}>
                            Attention! Êtes-vous sur de vouloir supprimer le projet <strong>{project.title}</strong> ? Cette action est{' '}
                            <strong>irréversible</strong> et supprimera toutes les données du projet incluant questions, plans et images.
                        </Trans>
                    </Flex>
                </div>
            </Modal>
        </div>
    );
};

export default EditProject;
