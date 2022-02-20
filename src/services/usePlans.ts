import React from 'react';

import { UserServiceContext } from './UserService';
import { ProjectServiceContext } from './useProject';
import type { Plan } from 'types/models/plan.type';

interface PlanRequests {
    addPlan(questionId: number, index?: number): Promise<Plan | null>;
    updatePlan(plan: Plan): Promise<void>;
    deletePlan(planId: number): Promise<void>;
    uploadPlanImage(questionIndex: number, planIndex: number, imageBlob: Blob): Promise<void>;
}

export const usePlanRequests = (): PlanRequests => {
    const { axiosLoggedRequest, isLoggedIn } = React.useContext(UserServiceContext);
    const { project, updateProject } = React.useContext(ProjectServiceContext);

    const uploadTemporaryImage = React.useCallback(
        async (imageBlob: Blob) => {
            const bodyFormData = new FormData();
            bodyFormData.append('image', imageBlob);

            try {
                const response = await axiosLoggedRequest({
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    url: '/plans/temp-image',
                    data: bodyFormData,
                });
                if (!response.error) {
                    return response.data.path || null;
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        },
        [axiosLoggedRequest],
    );

    const uploadImage = React.useCallback(
        async (imageBlob: Blob, planId: number) => {
            const bodyFormData = new FormData();
            bodyFormData.append('image', imageBlob);

            try {
                const response = await axiosLoggedRequest({
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    url: `/plans/${planId}/image`,
                    data: bodyFormData,
                });
                if (!response.error) {
                    return response.data.url || null;
                } else {
                    return null;
                }
            } catch (e) {
                return null;
            }
        },
        [axiosLoggedRequest],
    );

    const uploadPlanImage = React.useCallback(
        async (questionIndex: number, planIndex: number, imageBlob: Blob) => {
            const questions = project.questions || [];
            const question = questions[questionIndex] || null;
            if (question === null) return;
            question.plans = question.plans || [];
            const plan = question.plans[planIndex] || null;

            if (plan === null) {
                return;
            }

            if (isLoggedIn && project.id !== null && question.id !== null && plan.id) {
                plan.url = await uploadImage(imageBlob, plan.id);
            } else {
                plan.url = await uploadTemporaryImage(imageBlob);
            }

            (questions[questionIndex].plans || [])[planIndex] = plan;
            updateProject({
                questions,
            });
        },
        [isLoggedIn, project, updateProject, uploadImage, uploadTemporaryImage],
    );

    const addPlan = React.useCallback(
        async (questionId: number, index: number = 0) => {
            const response = await axiosLoggedRequest({
                method: 'POST',
                url: '/plans',
                data: {
                    index,
                    questionId,
                },
            });
            if (response.error) {
                return null;
            }
            return response.data;
        },
        [axiosLoggedRequest],
    );

    const updatePlan = React.useCallback(
        async (plan: Plan) => {
            if (!plan.id) {
                return;
            }
            await axiosLoggedRequest({
                method: 'PUT',
                url: `/plans/${plan.id}`,
                data: {
                    description: plan.description,
                    index: plan.index,
                },
            });
        },
        [axiosLoggedRequest],
    );

    const deletePlan = React.useCallback(
        async (planId: number) => {
            if (!planId) {
                return;
            }
            await axiosLoggedRequest({
                method: 'DELETE',
                url: `/plans/${planId}`,
            });
        },
        [axiosLoggedRequest],
    );

    return {
        uploadPlanImage,
        addPlan,
        updatePlan,
        deletePlan,
    };
};
