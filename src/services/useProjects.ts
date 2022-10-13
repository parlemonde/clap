import React from 'react';
import type { QueryFunction } from 'react-query';
import { useQuery } from 'react-query';

import { ProjectServiceContext } from './useProject';
import { UserServiceContext } from 'src/services/UserService';
import type { Project } from 'types/models/project.type';

export const useProjects = (): { projects: Project[] } => {
    const { user, isLoggedIn, axiosLoggedRequest } = React.useContext(UserServiceContext);
    const getProjects: QueryFunction<Project[]> = React.useCallback(async () => {
        if (!isLoggedIn) {
            return [];
        }
        const response = await axiosLoggedRequest({
            method: 'GET',
            url: `/projects`,
        });
        if (response.error) {
            return [];
        }
        return response.data;
    }, [isLoggedIn, axiosLoggedRequest]);
    const { data, isLoading, error } = useQuery<Project[], unknown>(['projects', { userId: user?.id ?? 0 }], getProjects);
    return {
        projects: isLoading || error ? [] : data || [],
    };
};

export const useProjectRequests = (): {
    uploadSound: (soundBlob: Blob) => Promise<void>;
    uploadProjectSound: (soundBlob: Blob) => Promise<void>;
} => {
    const { axiosLoggedRequest, isLoggedIn } = React.useContext(UserServiceContext);
    const { project, updateProject } = React.useContext(ProjectServiceContext);

    const uploadTemporarySound = React.useCallback(
        async (soundBlob: Blob) => {
            const bodyFormData = new FormData();
            bodyFormData.append('sound', soundBlob);

            try {
                const response = await axiosLoggedRequest({
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    url: '/projects/temp-sound',
                    data: bodyFormData,
                });
                if (!response.error) {
                    return response.data || null;
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        },
        [axiosLoggedRequest],
    );

    const uploadSound = React.useCallback(
        async (soundBlob: Blob) => {
            const bodyFormData = new FormData();
            bodyFormData.append('sound', soundBlob);
            try {
                const response = await axiosLoggedRequest({
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    url: `/projects/${project.id}/sound`,
                    data: bodyFormData,
                });
                if (!response.error) {
                    return response.data || null;
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        },
        [axiosLoggedRequest, project],
    );

    const uploadProjectSound = React.useCallback(
        async (soundBlob: Blob) => {
            if (project === null) return;

            if (isLoggedIn && project.id !== null) {
                const sound = await uploadSound(soundBlob);
                project.sound = sound;
            } else {
                project.sound = await uploadTemporarySound(soundBlob);
            }
            project.musicBeginTime = 0;
        },
        [isLoggedIn, project, updateProject, uploadSound, uploadTemporarySound],
    );

    return { uploadSound, uploadProjectSound };
};
