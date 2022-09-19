import { useSnackbar } from 'notistack';
import React from 'react';
import { useQueryClient } from 'react-query';
import { ReactSortable } from 'react-sortablejs';

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

import { AdminTile } from 'src/components/admin/AdminTile';
import { CreateQuestionModal } from 'src/components/admin/questions/CreateQuestionModal';
import { DeleteQuestionModal } from 'src/components/admin/questions/DeleteQuestionModal';
import { EditQuestionModal } from 'src/components/admin/questions/EditQuestionModal';
import { UserServiceContext } from 'src/services/UserService';
import { useLanguages } from 'src/services/useLanguages';
import { useQuestions } from 'src/services/useQuestions';
import { useScenarios } from 'src/services/useScenarios';
import { groupScenarios } from 'src/util/groupScenarios';
import type { Language } from 'types/models/language.type';
import type { Question } from 'types/models/question.type';

const AdminQuestions: React.FunctionComponent = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);
    const { languages } = useLanguages();
    const { scenarios } = useScenarios({ isDefault: true });
    const groupedScenarios = groupScenarios(scenarios);
    const [availableLanguages, setAvailableLanguages] = React.useState<Language[]>([]);
    const [selectedArgs, setSelectedArgs] = React.useState<{
        isDefault: boolean;
        scenarioId: number | string | null;
        languageCode: string;
    }>({
        isDefault: true,
        scenarioId: null,
        languageCode: 'fr',
    });
    const { questions, setQuestions } = useQuestions(selectedArgs);
    const [createModalOpen, setCreateModalOpen] = React.useState<boolean>(false);
    const [editQuestionIndex, setEditQuestionIndex] = React.useState<number>(-1);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = React.useState<number>(-1);

    const onSelectScenario = (event: SelectChangeEvent<string | number>) => {
        const scenarioId = typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value, 10);
        const scenarioLanguages = Object.keys(groupedScenarios.find((s) => s.id === scenarioId)?.names || {}).filter((key) => key !== 'default');
        if (scenarioLanguages.length === 0) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            return;
        }
        setAvailableLanguages(languages.filter((l) => scenarioLanguages.includes(l.value)));
        const selectedLanguage = scenarioLanguages.includes('fr') ? 'fr' : scenarioLanguages[0];
        setSelectedArgs((s) => ({ ...s, scenarioId, languageCode: selectedLanguage }));
    };
    const onLanguageChange = (event: SelectChangeEvent<string>) => {
        setSelectedArgs((s) => ({ ...s, languageCode: event.target.value }));
    };

    const setQuestionsOrder = async (newQuestions: Question[]) => {
        if (questions.map((q) => q.id).join(',') === newQuestions.map((q) => q.id).join(',')) {
            return;
        }
        setQuestions(newQuestions);
        const order = newQuestions.map((q) => q.id);
        try {
            const response = await axiosLoggedRequest({
                method: 'PUT',
                url: '/questions/update-order',
                data: {
                    order,
                },
            });
            if (response.error) {
                enqueueSnackbar('Une erreur inconnue est survenue...', {
                    variant: 'error',
                });
                queryClient.invalidateQueries('questions');
                console.error(response.error);
            }
        } catch (e) {
            enqueueSnackbar('Une erreur inconnue est survenue...', {
                variant: 'error',
            });
            queryClient.invalidateQueries('questions');
            console.error(e);
        }
    };

    const setQuestionsFunction = (f: (questions: Question[]) => Question[]) => {
        setQuestions(f(questions));
    };

    const selectLanguage = (
        <span style={{ marginLeft: '2rem' }}>
            (
            <Select variant="standard" value={selectedArgs.languageCode} color="secondary" style={{ color: 'white' }} onChange={onLanguageChange}>
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
                                value={selectedArgs.scenarioId || ''}
                                onChange={onSelectScenario}
                            >
                                {groupedScenarios.map((s) => (
                                    <MenuItem value={s.id} key={s.id}>
                                        {s.names.default}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </AdminTile>
                {selectedArgs.scenarioId !== null && (
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
                                    <ReactSortable
                                        tag={'tbody'}
                                        list={questions}
                                        setList={setQuestionsOrder}
                                        animation={100}
                                        handle=".questions-index"
                                    >
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
                                    </ReactSortable>
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
                    scenarioId={selectedArgs.scenarioId}
                    languageCode={selectedArgs.languageCode}
                    open={createModalOpen}
                    setQuestions={setQuestionsFunction}
                    order={Math.max(0, ...questions.map((q) => q.index)) + 1}
                />
                <EditQuestionModal
                    question={editQuestionIndex !== -1 ? questions[editQuestionIndex] || null : null}
                    setQuestions={setQuestionsFunction}
                    onClose={() => {
                        setEditQuestionIndex(-1);
                    }}
                />
                <DeleteQuestionModal
                    question={deleteQuestionIndex !== -1 ? questions[deleteQuestionIndex] || null : null}
                    setQuestions={setQuestionsFunction}
                    onClose={() => {
                        setDeleteQuestionIndex(-1);
                    }}
                />
            </NoSsr>
        </div>
    );
};

export default AdminQuestions;
