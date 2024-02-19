import { useRouter } from 'next/router';
import React from 'react';
import { io } from 'socket.io-client';

import { useCollaboration } from './useCollaboration';
import { useCurrentProject } from './useCurrentProject';
import { userContext } from 'src/contexts/userContext';
import { httpRequest } from 'src/utils/http-request';
import type { Project } from 'types/models/project.type';
import type { AlertStudentData, AlertTeacherData } from 'types/models/socket.type';

// const URL = 'http://localhost:5000';
const socket = io({ autoConnect: false });

export const useSocket = () => {
    const { updateProject: updateStoredProject } = useCurrentProject();
    const { setIsCollaborationActive } = useCollaboration();
    const router = useRouter();
    const { setUser } = React.useContext(userContext);

    const connect = () => {
        socket.connect();
        socket.removeAllListeners();
        setIsCollaborationActive(true);

        socket.off('updateProject', updateStoredProject).on('updateProject', updateStoredProject);
    };

    const disconnect = () => {
        socket.removeAllListeners();
        setIsCollaborationActive(false);
        socket.disconnect();
    };

    const connectTeacher = (project: Project) => {
        connect();
        startCollaboration(project);

        const alertTeacher = ({ projectId, sequencyOrder, status }: AlertTeacherData) => {
            if (window !== undefined) {
                router.pathname = window.location.pathname;
            }
            router.query.projectId = projectId;
            router.query.alert = 'teacher';
            router.query.sequency = sequencyOrder;
            router.query.status = status;
            router.push(router);
        };

        socket.off('alertTeacher', alertTeacher).on('alertTeacher', alertTeacher);
        socket.off('stopCollaboration', disconnect).on('stopCollaboration', disconnect);
    };

    const connectStudent = (projectId: number, sequencyId: number) => {
        connect();
        joinRoom(`project-${projectId}`);
        joinRoom(`project-${projectId}_question-${sequencyId}`);

        const stopCollaboration = async () => {
            disconnect();
            setIsCollaborationActive(false);
            router.push('/login');
            const response = await httpRequest({
                method: 'POST',
                url: '/logout',
            });
            if (response.success) {
                setUser(null);
            } else {
                throw response;
            }
        };
        socket.off('stopCollaboration', stopCollaboration).on('stopCollaboration', stopCollaboration);

        const sendFeedback = ({ feedback, projectId }: AlertStudentData) => {
            if (window !== undefined) {
                router.pathname = window.location.pathname;
            }
            router.query.projectId = projectId;
            router.query.alert = 'student';
            router.query.type = feedback ? 'feedback' : 'validation';
            router.push(router);
        };
        socket.off('alertStudent', sendFeedback).on('alertStudent', sendFeedback);
    };

    const startCollaboration = (project: Project) => {
        socket.emit('startCollaboration', project);
    };

    const stopCollaboration = (project: Project) => {
        setIsCollaborationActive(false);
        socket.emit('stopCollaboration', project);
    };

    const joinRoom = (room: string) => {
        socket.emit('joinRoom', room);
    };

    const leaveRoom = (room: string) => {
        socket.emit('leaveRoom', room);
    };

    const updateProject = (project: Project) => {
        socket.emit('updateProject', project);
    };

    const alertTeacher = (data: AlertTeacherData) => {
        socket.emit('alertTeacher', data);
    };

    const alertStudent = (data: AlertStudentData) => {
        socket.emit('alertStudent', data);
    };

    return {
        socket,
        connect,
        disconnect,
        startCollaboration,
        stopCollaboration,
        joinRoom,
        leaveRoom,
        updateProject,
        alertTeacher,
        alertStudent,
        connectStudent,
        connectTeacher,
    };
};
