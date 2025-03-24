'use client';

import React from 'react';

import { Button } from '../layout/Button';
import { Field, TextArea } from '../layout/Form';
import type { Sequence } from 'src/lib/project.types';

interface FeedbackFormProps {
    question: Sequence;
    onUpdateSequence: (sequence: Sequence) => void;
}
export const FeedbackForm = ({ question, onUpdateSequence }: FeedbackFormProps) => {
    const [feedback, setFeedback] = React.useState('');

    return (
        <div
            style={{
                padding: '20px 30px',
                border: '1px solid #737373',
                marginTop: '15px',
                borderRadius: '5px',
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2
                    style={{
                        display: 'inline-block',
                        fontSize: '30px',
                        borderBottom: '5px solid #79C3A5',
                    }}
                >
                    Travail à vérifier
                </h2>
            </div>

            {question.feedbacks && question.feedbacks.length > 0 && (
                <div>
                    <div style={{ fontSize: '14px' }}>Retours précédents :</div>
                    <ul>
                        {question.feedbacks.map((feedbackItem, index) => (
                            <li key={index}>{feedbackItem}</li>
                        ))}
                    </ul>
                </div>
            )}

            <Field
                marginTop="sm"
                name="feedback"
                label={<span style={{ fontSize: '14px' }}>Retours :</span>}
                input={
                    <TextArea
                        id="feedback"
                        name="feedback"
                        placeholder="Vos retours (Raccourcir la durée de la séquence, monter le son, ...)"
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        color="secondary"
                        isFullWidth
                    />
                }
            ></Field>
            <div
                style={{
                    marginTop: '16px',
                }}
            >
                <Button
                    as="a"
                    variant="contained"
                    color="secondary"
                    isUpperCase={false}
                    onClick={() => {
                        const newSequence: Sequence = {
                            ...question,
                            feedbacks: [...(question.feedbacks || []), feedback],
                            status: question.status === 'pre-mounting-validating' ? 'pre-mounting' : 'storyboard',
                        };
                        onUpdateSequence(newSequence);
                    }}
                    label="Envoyer le retour"
                    marginRight="md"
                ></Button>
                <Button
                    as="a"
                    variant="contained"
                    color="secondary"
                    isUpperCase={false}
                    onClick={() => {
                        const newFeedbacks = feedback ? [...(question.feedbacks || []), feedback] : question.feedbacks;
                        const newSequence: Sequence = {
                            ...question,
                            feedbacks: newFeedbacks,
                            status: question.status === 'pre-mounting-validating' ? 'validated' : 'pre-mounting',
                        };
                        onUpdateSequence(newSequence);
                    }}
                    label="Valider le travail"
                ></Button>
            </div>
        </div>
    );
};
