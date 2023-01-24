import { useSnackbar } from 'notistack';
import React from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import NoSsr from '@mui/material/NoSsr';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useLanguages } from 'src/api/languages/languages.list';
import { useQuestionTemplates } from 'src/api/question-templates/question-templates.list';
import { useUpdateQuestionTemplateOrderMutation } from 'src/api/question-templates/question-templates.order';
import { useScenarios } from 'src/api/scenarios/scenarios.list';
import { AdminTile } from 'src/components/admin/AdminTile';
import { CreateQuestionModal } from 'src/components/admin/questions/CreateQuestionModal';
import { DeleteQuestionModal } from 'src/components/admin/questions/DeleteQuestionModal';
import { EditQuestionModal } from 'src/components/admin/questions/EditQuestionModal';
import { Sortable } from 'src/components/ui/Sortable';
import type { QuestionTemplate } from 'types/models/question.type';

const AdminQuestions = () => {
    const { enqueueSnackbar } = useSnackbar();

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

    const onSelectScenario = (event: SelectChangeEvent<string | number>) => {
        const scenarioId = typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10);
        setSelectedScenarioId(scenarioId);
    };
    const onLanguageChange = (event: SelectChangeEvent<string>) => {
        setSelectedLanguage(event.target.value);
    };

    const updateQuestionOrderMutation = useUpdateQuestionTemplateOrderMutation();
    const setQuestionsOrder = (newQuestions: QuestionTemplate[]) => {
        updateQuestionOrderMutation.mutate(
            {
                order: newQuestions.map((q) => q.id),
            },
            {
                onError(err) {
                    console.error(err);
                    enqueueSnackbar('Une erreur inconnue est survenue...', {
                        variant: 'error',
                    });
                },
            },
        );
    };

    const selectLanguage = (
        <span style={{ marginLeft: '2rem' }}>
            (
            <Select variant="standard" value={selectedLanguage} color="secondary" style={{ color: 'white' }} onChange={onLanguageChange}>
                {availableLanguages.map((l) => (
                    <MenuItem key={l.value} value={l.value}>
                        {l.label.toLowerCase()}
                    </MenuItem>
                ))}
            </Select>
            )
        </span>
    );

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <Typography variant="h1" color="primary">
                Questions
            </Typography>
            <NoSsr>
                <AdminTile title="Choisir un scénario">
                    <div style={{ padding: '8px 16px 16px 16px' }}>
                        <FormControl fullWidth color="secondary">
                            <InputLabel id="demo-simple-select-label">Choisir le scénario</InputLabel>
                            <Select
                                variant="standard"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedScenarioId === -1 ? '' : selectedScenarioId}
                                onChange={onSelectScenario}
                            >
                                {scenarios.map((s) => (
                                    <MenuItem value={s.id} key={s.id}>
                                        {s.names.fr || s.names[Object.keys(s.names)[0]]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </AdminTile>
                {selectedScenarioId !== -1 && (
                    <AdminTile
                        title="Liste des questions du scénario"
                        selectLanguage={selectLanguage}
                        toolbarButton={
                            <Button
                                color="inherit"
                                sx={{ color: 'black' }}
                                onClick={() => {
                                    setCreateModalOpen(true);
                                }}
                                style={{ flexShrink: 0 }}
                                variant="contained"
                                startIcon={<AddCircleIcon />}
                            >
                                Ajouter une question
                            </Button>
                        }
                        style={{ marginTop: '2rem' }}
                    >
                        <Table aria-labelledby="themetabletitle" size="medium" aria-label="toutes les questions">
                            {questions.length > 0 ? (
                                <>
                                    <TableHead
                                        style={{ borderBottom: '1px solid white' }}
                                        sx={{
                                            backgroundColor: (theme) => theme.palette.secondary.main,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            minHeight: 'unset',
                                            padding: '8px 8px 8px 16px',
                                        }}
                                    >
                                        <TableRow>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Ordre</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Question</TableCell>
                                            <TableCell style={{ color: 'white', fontWeight: 'bold' }} align="right">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <Sortable component="tbody" list={questions} setList={setQuestionsOrder} handle=".questions-index">
                                        {questions.map((q, index) => (
                                            <TableRow
                                                key={q.id}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:nth-of-type(even)': {
                                                        backgroundColor: 'rgb(224 239 232)',
                                                    },
                                                    '&.sortable-ghost': {
                                                        opacity: 0,
                                                    },
                                                }}
                                            >
                                                <TableCell padding="none" className="questions-index">
                                                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'grab', marginLeft: '8px' }}>
                                                        <DragIndicatorIcon />
                                                        {index}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{q.question}</TableCell>
                                                <TableCell align="right" padding="none" style={{ minWidth: '96px' }}>
                                                    <Tooltip title="Modifier">
                                                        <IconButton
                                                            aria-label="edit"
                                                            onClick={() => {
                                                                setEditQuestionIndex(index);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <IconButton
                                                            aria-label="delete"
                                                            onClick={() => {
                                                                setDeleteQuestionIndex(index);
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Sortable>
                                </>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            Cette liste est vide !{' '}
                                            <Link
                                                onClick={() => {
                                                    setCreateModalOpen(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                                color="secondary"
                                            >
                                                Ajouter une question ?
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
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
            </NoSsr>
        </div>
    );
};

export default AdminQuestions;
