'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { StudentQuestionChoice } from './StudentQuestionChoice';
import { loginForStudent } from 'src/actions/authentication/login-for-student';
import { getProjectByCode } from 'src/actions/projects/get-project';
import { Button } from 'src/components/layout/Button';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';
import { Loader } from 'src/components/ui/Loader';
import type { ProjectData } from 'src/database/schemas/projects';
import { setToLocalStorage } from 'src/hooks/useLocalStorage/local-storage';

export const LoginStudentForm = () => {
    const router = useRouter();
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [projectCode, setProjectCode] = React.useState('');
    const [project, setProject] = React.useState<ProjectData | null>(null);

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setIsLoading(true);
        const project = await getProjectByCode(projectCode);
        if (!project) {
            setMessage('Code de collaboration invalide');
        } else {
            setMessage('');
            setProject(project.data);
        }
        setIsLoading(false);
    };

    const onSelectQuestion = async (questionId: number) => {
        setIsLoading(true);
        const result = await loginForStudent(projectCode, questionId);
        if ('errorMessage' in result) {
            setMessage(result.errorMessage);
        } else {
            setToLocalStorage('projectId', result.projectId);
            router.push('/create/3-storyboard');
        }
        setIsLoading(false);
    };

    return (
        <>
            {project ? (
                <StudentQuestionChoice project={project} onSelectQuestion={onSelectQuestion} />
            ) : (
                <>
                    <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                        Rejoindre une session collaborative
                    </Title>
                    <Form className="login-form" onSubmit={onSubmit}>
                        {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
                        <Field
                            name="projectCode"
                            label={<span style={{ display: 'inline-block', marginBottom: 4 }}>Code de collaboration</span>}
                            input={
                                <Input
                                    id="projectCode"
                                    name="projectCode"
                                    type="text"
                                    color="secondary"
                                    isFullWidth
                                    required
                                    value={projectCode}
                                    onChange={(ev) => setProjectCode(ev.target.value)}
                                />
                            }
                        ></Field>
                        <Button label="Rejoindre" variant="contained" color="secondary" type="submit" value="Submit"></Button>
                    </Form>
                </>
            )}
            <div className="text-center">
                <Link href="/login" className="color-primary">
                    Retour à la page de connexion
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </>
    );
};
