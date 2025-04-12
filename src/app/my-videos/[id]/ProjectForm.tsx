'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React from 'react';

import { deleteProject } from 'src/actions/projects/delete-project';
import { updateProject } from 'src/actions/projects/update-project';
import { Button } from 'src/components/layout/Button';
import { Divider } from 'src/components/layout/Divider';
import { Flex } from 'src/components/layout/Flex';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { Trans } from 'src/components/ui/Trans';
import { useTranslation } from 'src/contexts/translationContext';
import type { Project } from 'src/database/schemas/projects';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { deleteFromLocalStorage } from 'src/hooks/useLocalStorage/local-storage';

interface ProjectFormProps {
    project: Project;
}
export const ProjectForm = ({ project }: ProjectFormProps) => {
    const router = useRouter();
    const [, setProjectId] = useLocalStorage('projectId');
    const { t } = useTranslation();

    const [projectTitle, setProjectTitle] = React.useState<string>(project.name);
    const [showTitleModal, setShowTitleModal] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const onUpdateName = async () => {
        if (!projectTitle || projectTitle === project.name) {
            return;
        }
        setIsUpdating(true);
        await updateProject(project.id, { name: projectTitle }, true);
        setIsUpdating(false);
        setShowTitleModal(false);
    };

    const onDelete = async () => {
        setIsDeleting(true);
        deleteFromLocalStorage('projectId');
        await deleteProject(project.id);
        setIsDeleting(false);
        router.push('/my-videos');
    };

    return (
        <>
            <div style={{ marginTop: '0.5rem' }}>
                <label>
                    <strong>{t('project_name')} : </strong>
                </label>
                {project.name} -{' '}
                <a
                    tabIndex={0}
                    role="button"
                    className="color-primary"
                    onKeyDown={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') {
                            setProjectTitle(project.name);
                            setShowTitleModal(true);
                        }
                    }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => {
                        setProjectTitle(project.name);
                        setShowTitleModal(true);
                    }}
                >
                    {t('account_change_button')}
                </a>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('pdf_theme')}</strong>
                </label>
                {project.data.themeName}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('pdf_scenario')}</strong>
                </label>
                {project.data.scenarioName}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('project_question_number')}</strong>
                </label>
                {project.data.questions.length || 0}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('project_plan_number')}</strong>
                </label>
                {project.data.questions.reduce<number>((n, q) => n + (q.plans || []).length, 0) ?? 0}
            </div>
            <Button
                label={t('project_see_plans')}
                marginTop="md"
                className="mobile-full-width"
                variant="contained"
                color="secondary"
                size="sm"
                onClick={() => {
                    deleteFromLocalStorage('project');
                    setProjectId(project.id);
                    router.push(`/create/3-storyboard`);
                }}
            ></Button>
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
            <Modal
                isOpen={showTitleModal}
                onClose={() => {
                    setShowTitleModal(false);
                }}
                onConfirm={onUpdateName}
                confirmLabel={t('edit')}
                cancelLabel={t('cancel')}
                title={t('project_name')}
                isLoading={isUpdating}
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
                onConfirm={onDelete}
                confirmLabel={t('delete')}
                confirmLevel="error"
                cancelLabel={t('cancel')}
                title={t('project_delete_title')}
                isLoading={isDeleting}
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
                        <Trans i18nKey="project_delete_desc1" i18nParams={{ projectTitle: project.name }}>
                            Attention! Êtes-vous sur de vouloir supprimer le projet <strong>{project.name}</strong> ? Cette action est{' '}
                            <strong>irréversible</strong> et supprimera toutes les données du projet incluant questions, plans et images.
                        </Trans>
                    </Flex>
                </div>
            </Modal>
        </>
    );
};
