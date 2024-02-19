import React from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { useProject } from 'src/api/projects/projects.get';
import { getQuestionTemplates } from 'src/api/question-templates/question-templates.list';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { getFromLocalStorage, setToLocalStorage } from 'src/utils/local-storage';
import { useQueryId, useQueryNumber } from 'src/utils/useQueryId';
import type { Project } from 'types/models/project.type';

const createProject = async (userId: number | null, themeId: string | number, scenarioId: string | number, currentLocale: string) => {
    const newProject: Project = {
        id: 0,
        themeId: themeId ?? 0,
        scenarioId: scenarioId ?? 0,
        userId,
        title: '',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        languageCode: currentLocale,
        musicBeginTime: 0,
        soundUrl: null,
        soundVolume: 100,
    };
    if (typeof scenarioId === 'number') {
        try {
            const defaultQuestions = await getQuestionTemplates({
                scenarioId,
                languageCode: currentLocale,
            });
            newProject.questions = defaultQuestions.map((q, index) => ({
                id: index,
                question: q.question,
                projectId: 0,
                index,
                title: null,
                voiceOff: null,
                voiceOffBeginTime: 0,
                soundUrl: null,
                soundVolume: 100,
                plans: [
                    {
                        id: 0,
                        description: '',
                        index: 0,
                        imageUrl: '',
                        duration: 3000, // 3s
                    },
                ],
            }));
        } catch (err) {
            console.error(err);
            // fail silently
        }
    }
    return newProject;
};

const useLocalProject = (themeId?: string | number, scenarioId?: string | number) => {
    const queryClient = useQueryClient();
    const { user } = React.useContext(userContext);
    const { currentLocale } = useTranslation();

    const { data: localProject, isLoading } = useQuery(['local-project'], () => getFromLocalStorage('project', undefined), {
        refetchOnWindowFocus: 'always',
    });

    const shouldCreateLocalProject =
        !isLoading &&
        themeId !== undefined &&
        scenarioId !== undefined &&
        (localProject === undefined || localProject.themeId !== themeId || localProject.scenarioId !== scenarioId);
    const isCreatingRef = React.useRef(false);
    React.useEffect(() => {
        if (shouldCreateLocalProject && isCreatingRef.current === false && themeId !== undefined && scenarioId !== undefined) {
            isCreatingRef.current = true;
            createProject(user?.id ?? null, themeId, scenarioId, currentLocale).then((newProject) => {
                setToLocalStorage('project', newProject);
                queryClient.setQueryData(['local-project'], newProject);
                isCreatingRef.current = false;
            });
        }
    }, [shouldCreateLocalProject, user?.id, themeId, scenarioId, currentLocale, queryClient]);

    return {
        project: localProject,
        isLoading: isLoading || shouldCreateLocalProject,
    };
};

export const useCurrentProject = () => {
    const queryClient = useQueryClient();

    // --- QUERY STRINGS ---
    const projectId = useQueryNumber('projectId');
    const themeId = useQueryId('themeId');
    const scenarioId = useQueryId('scenarioId');

    // --- PROJECTS ---
    const { project: backendProject, isLoading: isLoadingBackend } = useProject(projectId, {
        refetchOnWindowFocus: 'always',
    });
    const { project: localProject, isLoading: isLoadingLocal } = useLocalProject(themeId, scenarioId);

    // --- CURRENT STATE ---
    const isUsingLocal = (themeId !== undefined && scenarioId !== undefined) || !projectId;
    const project = isUsingLocal ? localProject : backendProject;
    const isLoading = isUsingLocal ? isLoadingLocal : isLoadingBackend;
    const questions = project?.questions || [];

    const setProject = (newProject: Project) => {
        if (isUsingLocal) {
            setToLocalStorage('project', newProject);
            queryClient.setQueryData(['local-project'], newProject);
        } else {
            queryClient.setQueryData(['project', projectId], newProject);
        }
    };

    const updateProject = (updatedProject: Partial<Project>): Project | null => {
        if (project === undefined) {
            return null;
        }

        const projectUpdated = { ...project, ...updatedProject };
        setProject(projectUpdated);

        return projectUpdated;
    };

    return { project, isLoading, questions, setProject, updateProject };
};

export const useClearLocalProject = () => {
    const clearLocalProject = () => {
        const project = getFromLocalStorage('project', undefined);
        if (project) {
            setToLocalStorage('project', undefined);
            if (typeof window !== 'undefined') window.location.reload();
        }
    };

    return { clearLocalProject };
};
