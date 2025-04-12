'use client';

import React from 'react';
import useSWR from 'swr';

import { onSendCurrentProjectUpdateMsg } from './useCollaboration';
import { useLocalStorage } from './useLocalStorage';
import { updateProject } from 'src/actions/projects/update-project';
import { userContext } from 'src/contexts/userContext';
import type { Project, ProjectData } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

interface UseCurrentProjectData {
    project?: ProjectData;
    name?: string;
    setProject: (newProject: ProjectData) => void;
}

export const useCurrentProject = (): UseCurrentProjectData => {
    const { user } = React.useContext(userContext);
    const [localProjectId] = useLocalStorage('projectId');
    const projectId = user !== undefined ? localProjectId : undefined; // If user is not logged in, do not try to fetch last current project
    const [localProjectData, setLocalProjectData] = useLocalStorage('project');

    // Fetch project from backend
    const { data: project, mutate } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);

    // Update project
    const setProject = React.useCallback(
        (newProjectData: ProjectData) => {
            if (projectId !== undefined) {
                mutate(
                    async () => {
                        await updateProject(projectId, {
                            data: newProjectData,
                            themeId: typeof newProjectData.themeId === 'string' ? null : newProjectData.themeId,
                            scenarioId: typeof newProjectData.scenarioId === 'string' ? null : newProjectData.scenarioId,
                        });
                        return jsonFetcher<Project>(`/api/projects/${projectId}`);
                    },
                    {
                        optimisticData: project
                            ? {
                                  ...project,
                                  data: newProjectData,
                                  themeId: typeof newProjectData.themeId === 'string' ? null : newProjectData.themeId,
                                  scenarioId: typeof newProjectData.scenarioId === 'string' ? null : newProjectData.scenarioId,
                              }
                            : undefined,
                    },
                )
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        onSendCurrentProjectUpdateMsg();
                    });
            } else {
                setLocalProjectData(newProjectData);
            }
        },
        [projectId, mutate, project, setLocalProjectData],
    );

    return {
        project: projectId !== undefined ? project?.data : localProjectData,
        name: projectId !== undefined ? project?.name : '',
        setProject,
    };
};
