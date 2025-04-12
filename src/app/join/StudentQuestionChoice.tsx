'use client';

import * as React from 'react';

import { Text, Title } from 'src/components/layout/Typography';
import type { ProjectData } from 'src/database/schemas/projects';
import { COLORS } from 'src/lib/colors';

interface StudentQuestionChoiceProps {
    project: ProjectData;
    onSelectQuestion?: (questionId: number) => void;
}
export const StudentQuestionChoice = ({ project, onSelectQuestion }: StudentQuestionChoiceProps) => {
    return (
        <>
            <Title marginY="xl">Sélectionnez votre séquence :</Title>
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
                            <Text marginBottom="sm">{`Séquence n°${index + 1}`}</Text>
                            <Text marginBottom="sm">{q.question}</Text>
                            <div style={{ height: '150px', width: '150px', backgroundColor: COLORS[index] }}></div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
