import { Pencil1Icon, TrashIcon, PlusCircledIcon, DragHandleDots2Icon } from '@radix-ui/react-icons';
import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { useQuestionTemplates } from 'src/api/question-templates/question-templates.list';
import { useUpdateQuestionTemplateOrderMutation } from 'src/api/question-templates/question-templates.order';
import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { Table } from 'src/components/admin/Table';
import { CreateQuestionModal } from 'src/components/admin/questions/CreateQuestionModal';
import { DeleteQuestionModal } from 'src/components/admin/questions/DeleteQuestionModal';
import { EditQuestionModal } from 'src/components/admin/questions/EditQuestionModal';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Flex } from 'src/components/layout/Flex';
import { Select } from 'src/components/layout/Form/Select';
import { Tooltip } from 'src/components/layout/Tooltip';
import { Title } from 'src/components/layout/Typography';
import { Sortable } from 'src/components/ui/Sortable';
import { sendToast } from 'src/components/ui/Toasts';
import type { QuestionTemplate } from 'types/models/question.type';

const AdminQuestions = () => {
    const { languages } = useLanguages();
    const { scenarios } = useScenarios({ isDefault: true });

    const [selectedScenarioId, setSelectedScenarioId] = React.useState(-1);
    const [selectedLanguage, setSelectedLanguage] = React.useState('fr');
    const selectedScenario = selectedScenarioId === -1 ? undefined : scenarios.find((s) => s.id === selectedScenarioId) ?? undefined;
    const availableLanguages = selectedScenario === undefined ? [] : languages.filter((l) => selectedScenario.names[l.value] !== undefined);

    const { questionTemplates: questions } = useQuestionTemplates(
        {
            scenarioId: selectedScenarioId,
            languageCode: selectedLanguage,
        },
        { enabled: selectedScenarioId !== -1 },
    );
    const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
    const [editQuestionIndex, setEditQuestionIndex] = React.useState<number>(-1);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState<number>(-1);

    const updateQuestionOrderMutation = useUpdateQuestionTemplateOrderMutation();
    const setQuestionsOrder = (newQuestions: QuestionTemplate[]) => {
        updateQuestionOrderMutation.mutate(
            {
                order: newQuestions.map((q) => q.id),
            },
            {
                onError(err) {
                    console.error(err);
                    sendToast({ message: 'Une erreur inconnue est survenue...', type: 'error' });
                },
            },
        );
    };

    return (
        <div style={{ margin: '24px 32px' }}>
            <Title>Questions</Title>
            <AdminTile marginY="md" title="Choisir un scénario">
                <div style={{ padding: '8px 16px 16px 16px' }}>
                    <Select
                        value={selectedScenarioId === -1 ? '' : selectedScenarioId}
                        onChange={(event) => {
                            setSelectedScenarioId(parseInt(event.target.value, 10));
                        }}
                        style={{ color: selectedScenarioId === -1 ? 'grey' : undefined }}
                        isFullWidth
                    >
                        <option value={''} hidden>
                            Choisissez un scénario
                        </option>
                        {scenarios.map((s) => (
                            <option value={s.id} key={s.id}>
                                {s.names.fr || s.names[Object.keys(s.names)[0]]}
                            </option>
                        ))}
                    </Select>
                </div>
            </AdminTile>
            {selectedScenarioId !== -1 && (
                <AdminTile
                    marginY="md"
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
                </AdminTile>
            )}
            <CreateQuestionModal
                onClose={() => {
                    setCreateModalOpen(false);
                }}
                scenarioId={selectedScenarioId}
                languageCode={selectedLanguage}
                open={createModalOpen}
                order={Math.max(0, ...questions.map((q) => q.index)) + 1}
            />
            <EditQuestionModal
                question={editQuestionIndex !== -1 ? questions[editQuestionIndex] || null : null}
                onClose={() => {
                    setEditQuestionIndex(-1);
                }}
            />
            <DeleteQuestionModal
                question={deleteQuestionIndex !== -1 ? questions[deleteQuestionIndex] || null : null}
                onClose={() => {
                    setDeleteQuestionIndex(-1);
                }}
            />
        </div>
    );
};

export default AdminQuestions;
