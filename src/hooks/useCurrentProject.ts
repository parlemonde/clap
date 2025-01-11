import React from 'react';
import useSWR from 'swr';

import { useLocalStorage } from './useLocalStorage';
import type { LocalProject } from './useLocalStorage/local-storage';
import type { Project } from 'src/database/schemas/projects';
import { jsonFetcher } from 'src/lib/json-fetcher';

export const useCurrentProject = (): [LocalProject | undefined, (newProject: LocalProject) => void] => {
    const projectId = useLocalStorage('projectId')[0];
    const [localProject, setLocalProject] = useLocalStorage('project');
    const [backendProject, setBackendProject] = React.useState<LocalProject | undefined>(undefined);

    // Fetch project from backend
    const { data } = useSWR<Project>(projectId !== undefined ? `/api/projects/${projectId}` : null, jsonFetcher);
    React.useEffect(() => {
        setBackendProject(data);
    }, [data]);

    const setProject = React.useCallback(
        (newProject: LocalProject) => {
            if (projectId !== undefined) {
                setBackendProject(newProject);
                // TODO: Update project on backend
            } else {
                setLocalProject(newProject);
            }
        },
        [setLocalProject, projectId],
    );

    return [projectId !== undefined ? backendProject : localProject, setProject];
};
