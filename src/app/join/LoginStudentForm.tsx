'use client';

import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';
import { Loader } from '@frontend/components/ui/Loader';
import { setToLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import type { Project } from '@server/database/schemas/projects';
import { getProjectByCode } from '@server-actions/projects/get-project';

import { StudentQuestionChoice } from './StudentQuestionChoice';

export const LoginStudentForm = () => {
    const router = useRouter();
    const tx = useExtracted('join.LoginStudentForm');
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [projectCode, setProjectCode] = React.useState('');
    const [project, setProject] = React.useState<Project | null>(null);

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setIsLoading(true);
        const project = await getProjectByCode(projectCode.trim());
        if (!project) {
            setMessage(tx('Code de collaboration invalide'));
        } else {
            setMessage('');
            setProject(project);
        }
        setIsLoading(false);
    };

    const onSelectQuestion = async (questionId: number) => {
        setIsLoading(true);
        const response = await fetch('/api/auth/sign-in/student-collaboration', {
            body: JSON.stringify({
                code: projectCode.trim(),
                questionId,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });

        if (!response.ok) {
            setMessage(tx('Code de collaboration invalide'));
            setIsLoading(false);
            return;
        }

        if (!project) {
            setMessage(tx('Code de collaboration invalide'));
            setIsLoading(false);
            return;
        }

        setToLocalStorage('projectId', project.id);
        router.push('/create/3-storyboard');
        router.refresh();
        setIsLoading(false);
    };

    return (
        <>
            {project ? (
                <StudentQuestionChoice project={project.data} onSelectQuestion={onSelectQuestion} />
            ) : (
                <>
                    <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                        {tx('Rejoindre une session collaborative')}
                    </Title>
                    <Form className="login-form" onSubmit={onSubmit}>
                        {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
                        <Field
                            name="projectCode"
                            label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{tx('Code de collaboration')}</span>}
                            input={
                                <Input
                                    id="projectCode"
                                    name="projectCode"
                                    type="text"
                                    color="secondary"
                                    isFullWidth
                                    required
                                    value={projectCode}
                                    onChange={(ev) => setProjectCode(ev.target.value.replaceAll(/\D/g, '').slice(0, 6))}
                                />
                            }
                        ></Field>
                        <Button label={tx('Rejoindre')} variant="contained" color="secondary" type="submit" value="Submit"></Button>
                    </Form>
                </>
            )}
            <div className="text-center">
                <Link href="/login" className="color-primary">
                    {tx('Retour à la page de connexion')}
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </>
    );
};
