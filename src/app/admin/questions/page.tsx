'use server';

import * as React from 'react';
import type { ServerPageProps } from 'src/lib/page-props.types';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { listQuestions } from '@server-actions/questions/list-questions';
import { listScenarios } from '@server-actions/scenarios/list-scenarios';

import { QuestionsTile } from './QuestionsTile';
import { ScenarioSelect } from './ScenarioSelect';

export default async function AdminQuestionsPage(props: ServerPageProps) {
    const searchParams = await props.searchParams;
    const selectedScenarioId = typeof searchParams.scenarioId === 'string' ? Number(searchParams.scenarioId) || 0 : undefined;
    const scenarios = await listScenarios();

    const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
    const questions = selectedScenarioId ? await listQuestions(selectedScenarioId) : [];

    return (
        <Container>
            <Title marginTop="md">Questions</Title>
            <AdminTile marginY="md" title="Choisir un scénario">
                <div style={{ padding: '8px 16px 16px 16px' }}>
                    <ScenarioSelect selectedScenarioId={selectedScenarioId} scenarios={scenarios} />
                </div>
            </AdminTile>
            {selectedScenario && <QuestionsTile selectedScenario={selectedScenario} questions={questions} />}
        </Container>
    );
}
