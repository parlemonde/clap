'use server';

import * as React from 'react';
import { listQuestions } from 'src/actions/questions/list-questions';
import { listScenarios } from 'src/actions/scenarios/list-scenarios';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';
import type { ServerPageProps } from 'src/lib/page-props.types';

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
