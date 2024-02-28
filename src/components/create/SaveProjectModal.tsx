import { useRouter } from 'next/router';
import React from 'react';

import { Field, Form, Input } from '../layout/Form';
import { Modal } from '../layout/Modal';
import { sendToast } from '../ui/Toasts';
import { useCreateProjectMutation } from 'src/api/projects/projects.post';
import { useCollaboration } from 'src/hooks/useCollaboration';
import { useCurrentProject } from 'src/hooks/useCurrentProject';
import { useTranslation } from 'src/i18n/useTranslation';

type SaveProjectModalProps = {
    isOpen: boolean;
    onClose: (projectId?: number) => void;
};
export const SaveProjectModal = ({ isOpen, onClose }: SaveProjectModalProps) => {
    const router = useRouter();
    const { t } = useTranslation();
    const { project, questions } = useCurrentProject();

    const [title, setTitle] = React.useState('');
    const createProjectMutation = useCreateProjectMutation();
    const { setIsCollaborationActive } = useCollaboration();

    const onCreateProject = async () => {
        if (!project) {
            sendToast({ message: t('unknown_error'), type: 'error' });
            router.push('/create');
            return;
        }
        if (project.id !== 0 || typeof project.themeId !== 'number' || typeof project.scenarioId !== 'number') {
            onClose();
            return;
        }

        try {
            setIsCollaborationActive(false);
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
            sendToast({ message: t('project_saved'), type: 'success' });
            onClose(newProject.id);
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
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
        >
            <div id="save-project-form">
                <p>{t('project_save_desc')}</p>
                <Form className="project-form" noValidate autoComplete="off" marginY="lg" onSubmit={onCreateProject}>
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
    );
};
