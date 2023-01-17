import { useRouter } from 'next/router';
import React from 'react';

import { getProject as getProjectRequest } from 'src/api/projects/projects.get';
import { getQuestionTemplates } from 'src/api/question-templates/question-templates.list';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { getFromLocalStorage, setToLocalStorage } from 'src/utils/local-storage';
import { useQueryId, useQueryNumber } from 'src/utils/useQueryId';
import type { Project } from 'types/models/project.type';
import type { Question } from 'types/models/question.type';

type ProjectContext = {
    project: Project | undefined;
    isLoading: boolean;
    questions: Question[];
    setProject: React.Dispatch<React.SetStateAction<Project | undefined>>;
    updateProject: (updatedProject: Partial<Project>) => void;
};

export const projectContext = React.createContext<ProjectContext>({
    project: undefined,
    isLoading: true,
    questions: [],
    setProject: () => {},
    updateProject: () => {},
});

export const ProjectContextProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { user } = React.useContext(userContext);
    const { currentLocale } = useTranslation();

    // --- QUERY STRINGS ---
    const projectId = useQueryNumber('projectId');
    const themeId = useQueryId('themeId');
    const scenarioId = useQueryId('scenarioId');
    const userId = user ? user.id : null;

    // --- STATE ---
    const [project, _setProject] = React.useState<Project | undefined>(undefined);
    const [isProjectLoading, setIsProjectLoading] = React.useState(true);

    const setProject = React.useCallback((action: React.SetStateAction<Project | undefined>) => {
        _setProject((prevProject) => {
            let newProject: Project | undefined;
            if (typeof action === 'function') {
                newProject = action(prevProject);
            } else {
                newProject = action;
            }
            setToLocalStorage('project', newProject);
            return newProject;
        });
    }, []);

    const updateProject = React.useCallback((updatedProject: Partial<Project>) => {
        _setProject((prevProject) => {
            if (prevProject === undefined) {
                return;
            }
            const newProject = { ...prevProject, ...updatedProject };
            setToLocalStorage('project', newProject);
            return newProject;
        });
    }, []);

    const getProject = React.useCallback(async () => {
        setIsProjectLoading(true);
        const newProject = await getProjectRequest(projectId);
        setProject(newProject);
        if (newProject === undefined) {
            router.replace('/create');
        }
        setIsProjectLoading(false);
    }, [projectId, router, setProject]);

    const createProject = React.useCallback(async () => {
        setIsProjectLoading(true);
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
        }
        setProject(newProject);
        setIsProjectLoading(false);
    }, [currentLocale, scenarioId, setProject, themeId, userId]);

    const previousQueryValues = React.useRef({ projectId, themeId, scenarioId });
    React.useEffect(() => {
        previousQueryValues.current = { projectId, themeId, scenarioId };
        const localProject = getFromLocalStorage('project', undefined);
        if (projectId !== undefined && (localProject === undefined || localProject.id !== projectId)) {
            getProject().catch();
        } else if (
            themeId !== undefined &&
            scenarioId !== undefined &&
            (localProject === undefined || localProject.id !== 0 || localProject.themeId !== themeId || localProject.scenarioId !== scenarioId)
        ) {
            createProject().catch();
        } else {
            setProject(localProject);
            setIsProjectLoading(false);
        }
    }, [projectId, themeId, scenarioId, getProject, createProject, setProject]);

    const questions = React.useMemo(() => (project ? project.questions || [] : []), [project]);

    const willLoad = React.useMemo(() => {
        if (project !== undefined) {
            // Will load if current project is different from query params.
            return (
                (projectId !== undefined && project.id !== projectId) ||
                (themeId !== undefined &&
                    scenarioId !== undefined &&
                    (project.themeId !== themeId || project.scenarioId !== scenarioId || project.id !== 0))
            );
        }
        // Or will load if project is undefined and query params are defined.
        return projectId !== undefined || (themeId !== undefined && scenarioId !== undefined);
    }, [project, projectId, scenarioId, themeId]);
    const isLoading = isProjectLoading || willLoad;

    const projectContextValue = React.useMemo(
        () => ({ project: isLoading ? undefined : project, setProject, updateProject, questions, isLoading }),
        [project, isLoading, questions, setProject, updateProject],
    );
    return <projectContext.Provider value={projectContextValue}>{children}</projectContext.Provider>;
};
