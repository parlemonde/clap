'use client';

import { useExtracted, useFormatter } from 'next-intl';
import * as React from 'react';

import { Text, Title } from '@frontend/components/layout/Typography';
import { COLORS } from '@frontend/lib/colors';
import type { ProjectData } from '@server/database/schemas/projects';

interface StudentQuestionChoiceProps {
    project: ProjectData;
    onSelectQuestion?: (questionId: number) => void;
}
export const StudentQuestionChoice = ({ project, onSelectQuestion }: StudentQuestionChoiceProps) => {
    const t = useExtracted('join.StudentQuestionChoice');
    const format = useFormatter();
    return (
        <>
            <Title marginY="xl">{t('Sélectionnez votre séquence :')}</Title>
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
                            <Text marginBottom="sm">{t('Séquence n°{number}', { number: format.number(index + 1) })}</Text>
                            <Text marginBottom="sm">{q.question}</Text>
                            <div style={{ height: '150px', width: '150px', backgroundColor: COLORS[index] }}></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
