'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Text, Title } from '@frontend/components/layout/Typography';
import { COLORS } from '@frontend/lib/colors';
import type { ProjectData } from '@server/database/schemas/projects';

interface StudentQuestionChoiceProps {
    project: ProjectData;
    onSelectQuestion?: (questionId: number) => void;
}
export const StudentQuestionChoice = ({ project, onSelectQuestion }: StudentQuestionChoiceProps) => {
    const t = useTranslations();
    return (
        <>
            <Title marginY="xl">{t('join_page.question_choice.title')}</Title>
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
                            <Text marginBottom="sm">{`${t('join_page.question_choice.sequence_number', { number: index + 1 })}`}</Text>
                            <Text marginBottom="sm">{q.question}</Text>
                            <div style={{ height: '150px', width: '150px', backgroundColor: COLORS[index] }}></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
