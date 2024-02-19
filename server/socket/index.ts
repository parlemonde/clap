import type { Server as HttpServer } from 'http';
import type { Project } from 'server/entities/project';
import type { Question } from 'server/entities/question';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import type { AlertStudentData, AlertTeacherData } from '../../types/models/socket.type';

export function startSocketServer(server: HttpServer) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'INFO'],
        },
    });

    io.on('connection', (socket: Socket) => {
        socket.on('startCollaboration', (project: Project) => {
            const projectRoom: string = `project-${project.id}`;
            socket.join(projectRoom);
            project.questions?.map((q: Question) => {
                socket.join(`${projectRoom}_question-${q.id}`);
            });
        });

        socket.on('stopCollaboration', (project: Project) => {
            socket.broadcast.to(`project-${project.id}`).emit('stopCollaboration');
        });

        socket.on('joinRoom', (room: string) => {
            socket.join(room);
        });

        socket.on('leaveRoom', (room: string) => {
            socket.leave(room);
        });

        socket.on('updateProject', (project: Project) => {
            socket.broadcast.to(`project-${project.id}`).emit('updateProject', project);
        });

        socket.on('alertTeacher', (data: AlertTeacherData) => {
            socket.broadcast.to(`project-${data.projectId}_question-${data.sequencyId}`).emit('alertTeacher', data);
        });

        socket.on('alertStudent', (data: AlertStudentData) => {
            socket.broadcast.to(data.room).emit('alertStudent', data);
        });
    });
}
