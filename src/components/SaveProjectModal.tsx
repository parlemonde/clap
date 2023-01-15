import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { TextField } from '@mui/material';

import Modal from './ui/Modal';
import { useCreateProjectMutation } from 'src/api/projects/projects.post';
import { projectContext } from 'src/contexts/projectContext';
import { useTranslation } from 'src/i18n/useTranslation';

type SaveProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
};
export const SaveProjectModal = ({ isOpen, onClose }: SaveProjectModalProps) => {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();
    const { project, questions, updateProject } = React.useContext(projectContext);

    const [title, setTitle] = React.useState('');
    const createProjectMutation = useCreateProjectMutation();

    const onCreateProject = async () => {
        if (!project) {
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
            router.push('/create');
            return;
        }
        if (project.id !== 0 || typeof project.themeId !== 'number' || typeof project.scenarioId !== 'number') {
            onClose();
            return;
        }

        try {
            const newProject = await createProjectMutation.mutateAsync({
                title,
                themeId: project.themeId,
                scenarioId: project.scenarioId,
                questions: questions.map((q) => ({
                    ...q,
                    title: q.title
                        ? {
                              ...q.title,
                              duration: Math.round(q.title.duration),
                          }
                        : null,
                    voiceOffBeginTime: Math.round(q.voiceOffBeginTime),
                    plans: (q.plans || []).map((p) => ({ ...p, duration: Math.round(p.duration || 1000) })),
                })),
                soundUrl: project.soundUrl,
                soundVolume: project.soundVolume,
                musicBeginTime: Math.round(project.musicBeginTime),
            });
            updateProject({ id: newProject.id });
            enqueueSnackbar('Project saved successfully!', {
                variant: 'success',
            });
            onClose();
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onCreateProject}
            hasCloseButton={false}
            title={t('project_save_title')}
            cancelLabel={t('project_save_cancel')}
            confirmLabel={t('project_save_confirm')}
            confirmLevel="secondary"
            isConfirmDisabled={title.length === 0}
            isLoading={createProjectMutation.isLoading}
            ariaLabelledBy="save-project-label"
            ariaDescribedBy="save-project-form"
        >
            <div id="save-project-form">
                <p>{t('project_save_desc')}</p>
                <form className="project-form" noValidate autoComplete="off" style={{ margin: '1rem 0' }} onSubmit={onCreateProject}>
                    <TextField
                        id="project-name"
                        name="project-name"
                        type="text"
                        color="secondary"
                        label={t('project_save_label')}
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value.slice(0, 200));
                        }}
                        variant="outlined"
                        size="small"
                        helperText={`${title.length}/200`}
                        FormHelperTextProps={{ style: { textAlign: 'right' } }}
                        fullWidth
                    />
                </form>
            </div>
        </Modal>
    );
};
