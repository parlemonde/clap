'use client';
import { DragHandleDots2Icon, Pencil1Icon, PlusCircledIcon, TrashIcon } from '@radix-ui/react-icons';
import React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Table } from '@frontend/components/admin/Table';
import { Button } from '@frontend/components/layout/Button';
import { IconButton } from '@frontend/components/layout/Button/IconButton';
import { Flex } from '@frontend/components/layout/Flex';
import { Select } from '@frontend/components/layout/Form/Select';
import { Tooltip } from '@frontend/components/layout/Tooltip';
import { Title } from '@frontend/components/layout/Typography';
import { Sortable } from '@frontend/components/ui/Sortable';
import { sendToast } from '@frontend/components/ui/Toasts';
import { useLanguages } from '@frontend/hooks/useLanguages';

import type { Question } from '@server/database/schemas/questions';
import type { Scenario } from '@server/database/schemas/scenarios';

import { reOrderQuestions } from '@server-actions/questions/re-order-questions';

import { CreateQuestionModal } from './CreateQuestionModal';
import { DeleteQuestionModal } from './DeleteQuestionModal';
import { EditQuestionModal } from './EditQuestionModal';

interface QuestionsTileProps {
    selectedScenario: Scenario;
    questions: Question[];
}

export const QuestionsTile = ({ selectedScenario, questions: allQuestions }: QuestionsTileProps) => {
    const languages = useLanguages();

    const availableLanguages = languages.filter((l) => selectedScenario.names[l.value] !== undefined);
    if (availableLanguages.length === 0) {
        availableLanguages.push({ label: 'français', value: 'fr' });
    }
    const [selectedLanguage, setSelectedLanguage] = React.useState(
        availableLanguages.map((l) => l.value).includes('fr') ? 'fr' : availableLanguages[0].value,
    );

    const questions = allQuestions.filter((q) => q.languageCode === selectedLanguage);

    const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
    const [editQuestionIndex, setEditQuestionIndex] = React.useState<number>(-1);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState<number>(-1);

    const setQuestionsOrder = (questions: Question[]) => {
        reOrderQuestions(questions.map((t) => t.id)).catch((error) => {
            console.error(error);
            sendToast({ message: "Erreur lors de la mise à jour de l'ordre des questions...", type: 'error' });
        });
    };

    return (
        <AdminTile
            title={
                <Flex isFullWidth alignItems="center" justifyContent="flex-start">
                    <Title variant="h2" color="inherit">
                        Liste des questions du scénario
                    </Title>
                    <span style={{ marginLeft: '2rem' }}>
                        (
                        <Select
                            value={selectedLanguage}
                            color="secondary"
                            onChange={(event) => {
                                setSelectedLanguage(event.target.value);
                            }}
                            width="unset"
                            style={{
                                backgroundColor: 'transparent',
                                color: 'white',
                                borderTop: 'none',
                                borderLeft: 'none',
                                borderRight: 'none',
                                borderRadius: 0,
                                padding: '4px 26px 4px 4px',
                            }}
                        >
                            {availableLanguages.map((l) => (
                                <option key={l.value} value={l.value}>
                                    {l.label.toLowerCase()}
                                </option>
                            ))}
                        </Select>
                        )
                    </span>
                </Flex>
            }
            actions={
                <Button
                    label={'Ajouter une question'}
                    onClick={() => {
                        setCreateModalOpen(true);
                    }}
                    variant="contained"
                    color="light-grey"
                    leftIcon={<PlusCircledIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />}
                ></Button>
            }
        >
            <Table aria-label="toutes les questions">
                {questions.length > 0 ? (
                    <>
                        <thead>
                            <tr>
                                <th align="left">Ordre</th>
                                <th align="left">Question</th>
                                <th align="right">Actions</th>
                            </tr>
                        </thead>
                        <Sortable component="tbody" list={questions} setList={setQuestionsOrder} handle=".questions-index">
                            {questions.map((q, index) => (
                                <tr key={q.id}>
                                    <th className="questions-index">
                                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'grab', marginLeft: '8px' }}>
                                            <DragHandleDots2Icon />
                                            {index}
                                        </div>
                                    </th>
                                    <th style={{ padding: '0 16px' }}>{q.question}</th>
                                    <th align="right" style={{ minWidth: '96px' }}>
                                        <Tooltip content="Modifier">
                                            <IconButton
                                                margin="xs"
                                                aria-label="edit"
                                                variant="borderless"
                                                onClick={() => {
                                                    setEditQuestionIndex(index);
                                                }}
                                                icon={Pencil1Icon}
                                            ></IconButton>
                                        </Tooltip>
                                        <Tooltip content="Supprimer">
                                            <IconButton
                                                marginY="xs"
                                                marginRight="sm"
                                                aria-label="delete"
                                                onClick={() => {
                                                    setDeleteQuestionIndex(index);
                                                }}
                                                variant="borderless"
                                                color="error"
                                                icon={TrashIcon}
                                            ></IconButton>
                                        </Tooltip>
                                    </th>
                                </tr>
                            ))}
                        </Sortable>
                    </>
                ) : (
                    <tbody>
                        <tr>
                            <th colSpan={3} align="center">
                                Cette liste est vide !{' '}
                                <Button
                                    label="Ajouter une question ?"
                                    onClick={() => {
                                        setCreateModalOpen(true);
                                    }}
                                    color="secondary"
                                    variant="borderless"
                                ></Button>
                            </th>
                        </tr>
                    </tbody>
                )}
            </Table>
            <CreateQuestionModal
                onClose={() => {
                    setCreateModalOpen(false);
                }}
                scenarioId={selectedScenario.id}
                languageCode={selectedLanguage}
                open={createModalOpen}
            />
            <EditQuestionModal
                question={editQuestionIndex !== -1 ? questions[editQuestionIndex] : null}
                onClose={() => {
                    setEditQuestionIndex(-1);
                }}
            />
            <DeleteQuestionModal
                question={deleteQuestionIndex !== -1 ? questions[deleteQuestionIndex] : null}
                onClose={() => {
                    setDeleteQuestionIndex(-1);
                }}
            />
        </AdminTile>
    );
};
