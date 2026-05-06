'use client';

import { InfoCircledIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Divider } from '@frontend/components/layout/Divider';
import { Flex } from '@frontend/components/layout/Flex';
import { Field, Input } from '@frontend/components/layout/Form';
import { Modal } from '@frontend/components/layout/Modal';
import { Title } from '@frontend/components/layout/Typography';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { deleteFromLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import type { Project } from '@server/database/schemas/projects';
import { deleteProject } from '@server-actions/projects/delete-project';
import { updateProject } from '@server-actions/projects/update-project';

interface ProjectFormProps {
    project: Project;
}
export const ProjectForm = ({ project }: ProjectFormProps) => {
    const router = useRouter();
    const [, setProjectId] = useLocalStorage('projectId');

    const t = useExtracted('my-videos.[id].ProjectForm');
    const commonT = useExtracted('common');

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
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('Nom du projet :')}</strong>
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
                    {t('Changer')}
                </a>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('Thème :')}</strong>
                </label>
                {project.data.themeName}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('Scénario :')}</strong>
                </label>
                {project.data.scenarioName}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('Nombre de séquences :')}</strong>
                </label>
                {project.data.questions.length || 0}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginRight: '0.5rem' }}>
                    <strong>{t('Nombre de plans :')}</strong>
                </label>
                {project.data.questions.reduce<number>((n, q) => n + (q.plans || []).length, 0) ?? 0}
            </div>
            <Button
                label={t('Voir les plans')}
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
                {t('Supprimer le projet')}
            </Title>
            <Button
                label={t('Supprimer le projet')}
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
                confirmLabel={commonT('Modifier')}
                cancelLabel={commonT('Annuler')}
                title={t('Modifier le nom du projet')}
                isLoading={isUpdating}
                onOpenAutoFocus={false}
                isFullWidth
            >
                <div id="project-dialog-description">
                    <Field
                        name="description"
                        label={t('Nom du projet')}
                        input={
                            <Input
                                name="description"
                                id="description"
                                isFullWidth
                                value={projectTitle}
                                placeholder={t('Mon projet')}
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
                confirmLabel={commonT('Supprimer')}
                confirmLevel="error"
                cancelLabel={commonT('Annuler')}
                title={t('Supprimer le projet ?')}
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
                        {t.rich('Voulez-vous vraiment supprimer le projet <strong>{projetName}</strong> ?', {
                            projetName: project.name,
                            strong: (chunks) => <strong>{chunks}</strong>,
                        })}
                    </Flex>
                </div>
            </Modal>
        </>
    );
};
