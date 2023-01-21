import { default as NextLink } from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useDeleteProjectMutation } from 'src/api/projects/projects.delete';
import { useProject } from 'src/api/projects/projects.get';
import { useUpdateProjectMutation } from 'src/api/projects/projects.put';
import { useScenario } from 'src/api/scenarios/scenarios.get';
import { useTheme } from 'src/api/themes/themes.get';
import Modal from 'src/components/ui/Modal';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';
import { getQueryString } from 'src/utils/get-query-string';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';

const EditProject: React.FC = () => {
    const router = useRouter();
    const { t, currentLocale } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
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
            enqueueSnackbar('Projet modifié !', {
                variant: 'success',
            });
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
        setShowTitleModal(false);
    };

    const deleteProjectMutation = useDeleteProjectMutation();
    const onDeleteProject = async () => {
        try {
            await deleteProjectMutation.mutateAsync({ projectId });
            enqueueSnackbar('Projet supprimé !', {
                variant: 'success',
            });
            router.push('/my-videos');
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
        }
        setShowDeleteModal(false);
    };

    if (!project) {
        return <div></div>;
    }

    return (
        <div>
            <div className="text-center" style={{ margin: '1rem 0' }}>
                <Typography color="primary" variant="h1" style={{ display: 'inline' }}>
                    {t('project')}
                </Typography>
                <Typography color="inherit" variant="h1" style={{ display: 'inline', marginLeft: '0.5rem' }}>
                    {project.title}
                </Typography>
            </div>
            <div style={{ maxWidth: '800px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography variant="h2">{t('project_details')}</Typography>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>
                        <strong>{t('project_name')} : </strong>
                    </label>
                    {project.title} -{' '}
                    <Link
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setProjectTitle(project.title);
                            setShowTitleModal(true);
                        }}
                    >
                        {t('account_change_button')}
                    </Link>
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
                <NextLink href={`/create/3-storyboard${serializeToQueryUrl({ projectId: project?.id || null })}`} passHref>
                    <Button
                        component="a"
                        style={{ marginTop: '0.8rem' }}
                        className="mobile-full-width"
                        variant="contained"
                        color="secondary"
                        size="small"
                    >
                        {t('project_see_plans')}
                    </Button>
                </NextLink>
                <Divider style={{ margin: '1rem 0 1.5rem' }} />
                <Typography variant="h2">{t('project_delete')}</Typography>
                <Button
                    sx={{
                        color: (theme) => theme.palette.error.contrastText,
                        background: (theme) => theme.palette.error.light,
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.error.dark,
                        },
                    }}
                    style={{ marginTop: '0.8rem' }}
                    onClick={() => setShowDeleteModal(true)}
                    className="mobile-full-width"
                    variant="contained"
                    size="small"
                >
                    {t('project_delete')}
                </Button>
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
                ariaLabelledBy="project-dialog-title"
                ariaDescribedBy="project-dialog-description"
                isLoading={updateProjectMutation.isLoading}
                isFullWidth
            >
                <div id="project-dialog-description">
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={projectTitle}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        placeholder={t('project_name')}
                        label={t('project_name')}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setProjectTitle(event.target.value.slice(0, 200));
                        }}
                        helperText={`${projectTitle.length}/200`}
                        FormHelperTextProps={{ style: { textAlign: 'right' } }}
                        color="secondary"
                    />
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
                ariaLabelledBy="delete-dialog-title"
                ariaDescribedBy="delete-dialog-description"
                isLoading={deleteProjectMutation.isLoading}
                isFullWidth
            >
                <div id="delete-dialog-description">
                    <Alert severity="error" style={{ marginBottom: '1rem' }}>
                        <Trans i18nKey="project_delete_desc1" i18nParams={{ projectTitle: project.title }}>
                            Attention! Êtes-vous sur de vouloir supprimer le projet <strong>{project.title}</strong> ? Cette action est{' '}
                            <strong>irréversible</strong> et supprimera toutes les données du projet incluant questions, plans et images.
                        </Trans>
                        <br />
                    </Alert>
                </div>
            </Modal>
        </div>
    );
};

export default EditProject;
