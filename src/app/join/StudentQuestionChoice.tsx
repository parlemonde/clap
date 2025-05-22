'use client';

import * as React from 'react';

import { Text, Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/contexts/translationContext';
import type { ProjectData } from 'src/database/schemas/projects';
import { COLORS } from 'src/lib/colors';

interface StudentQuestionChoiceProps {
    project: ProjectData;
    onSelectQuestion?: (questionId: number) => void;
}
export const StudentQuestionChoice = ({ project, onSelectQuestion }: StudentQuestionChoiceProps) => {
    const { t } = useTranslation();
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
