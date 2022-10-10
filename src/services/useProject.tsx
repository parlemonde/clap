import { useRouter } from 'next/router';
import qs from 'query-string';
import React from 'react';

import { UserServiceContext } from './UserService';
import { getQueryString } from 'src/util';
import type { Project } from 'types/models/project.type';
import type { Theme } from 'types/models/theme.type';

const DEFAULT_PROJECT: Project = {
    id: -1,
    title: '',
    date: new Date(),
    user: null,
    theme: null,
    scenario: null,
    questions: null,
    musicBeginTime: 0,
    sound: null,
};

interface ProjectServiceContextValue {
    project: Project;
    updateProject(newProject: Partial<Project>): void;
}
interface ProjectServiceProviderProps {
    children: React.ReactNodeArray;
}

export const ProjectServiceContext = React.createContext<ProjectServiceContextValue>({
    project: DEFAULT_PROJECT,
    updateProject: () => {},
});

export const ProjectServiceProvider: React.FunctionComponent<ProjectServiceProviderProps> = ({ children }: ProjectServiceProviderProps) => {
    const router = useRouter();
    const { isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
    const [project, setProject] = React.useState<Project | null>(null);

    const getDefaultProject = React.useCallback(async (): Promise<Project> => {
        let defaultProject: Project | null = DEFAULT_PROJECT;
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const locationParams = qs.parse(window.location.search);

            // take last project for part 2, 3 and 4.
            if (locationParams.project || locationParams.projectId) {
                const response = await axiosLoggedRequest({
                    method: 'GET',
                    url: `/projects/${locationParams.project || locationParams.projectId}`,
                });
                if (!response.error) {
                    defaultProject = response.data;
                } else {
                    defaultProject = null;
                }
            } else if (
                path.slice(0, 26) === '/create/2-questions-choice' ||
                path.slice(0, 41) === '/create/3-storyboard-and-filming-schedule' ||
                path.slice(0, 22) === '/create/4-pre-mounting' ||
                path.slice(0, 24) === '/create/6-to-your-camera'
            ) {
                try {
                    defaultProject = JSON.parse(localStorage.getItem('lastProject') || 'null') || null;
                    if (defaultProject !== null && defaultProject.id !== -1 && !isLoggedIn) {
                        defaultProject = null;
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                // look for location params.
                const themeID = getQueryString(locationParams.themeId);
                if (themeID) {
                    let theme: Theme | null = null;
                    if (themeID.slice(0, 5) === 'local') {
                        theme =
                            (JSON.parse(localStorage.getItem('themes') || '[]') || []).find((t: Theme) => t.id === locationParams.themeId) || null;
                    } else {
                        const response = await axiosLoggedRequest({
                            method: 'GET',
                            url: `/themes/${locationParams.themeId}`,
                        });
                        if (!response.error) {
                            theme = response.data;
                        }
                    }
                    defaultProject.theme = theme;
                }
            }

            if (path.slice(0, 7) === '/create' && defaultProject === null) {
                router.push('/create');
            }
        }
        return defaultProject || DEFAULT_PROJECT;
    }, [router, isLoggedIn, axiosLoggedRequest]);

    // on init set project
    React.useEffect(() => {
        if (router.pathname.slice(0, 7) !== '/create') {
            localStorage.removeItem('lastProject');
            setProject(null);
        } else {
            if (project === null) {
                getDefaultProject()
                    .then((p) => {
                        setProject(p);
                        localStorage.setItem('lastProject', JSON.stringify(p));
                    })
                    .catch();
            }
        }
    }, [router.pathname, getDefaultProject, project]);

    const updateProject = (newProject: Partial<Project>): void => {
        setProject((p) => {
            if (p === null) {
                return p;
            }
            localStorage.setItem('lastProject', JSON.stringify({ ...p, ...newProject }));
            return {
                ...p,
                ...newProject,
            };
        });
    };

    return <ProjectServiceContext.Provider value={{ project: project || DEFAULT_PROJECT, updateProject }}>{children}</ProjectServiceContext.Provider>;
};
