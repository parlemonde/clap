'use client';

import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Text, Title } from '@frontend/components/layout/Typography';
import { COLORS } from '@frontend/lib/colors';
import type { ProjectData } from '@server/database/schemas/projects';

interface StudentQuestionChoiceProps {
    project: ProjectData;
    onSelectQuestion?: (questionId: number) => void;
}
export const StudentQuestionChoice = ({ project, onSelectQuestion }: StudentQuestionChoiceProps) => {
    const tx = useExtracted('join.StudentQuestionChoice');
    return (
        <>
            <Title marginY="xl">{tx('Sélectionnez votre séquence :')}</Title>
            <div className="sequency-list">
                {project.questions.map((q, index) => {
                    return (
                        <div
                            className="sequency-list__item"
                            onClick={() => {
                                onSelectQuestion?.(q.id);
                            }}
                            key={index}
                        >
                            <Text marginBottom="sm">{`${tx('Séquence n°{number}', { number: String(index + 1) })}`}</Text>
                            <Text marginBottom="sm">{q.question}</Text>
                            <div style={{ height: '150px', width: '150px', backgroundColor: COLORS[index] }}></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
