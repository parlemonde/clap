'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Field, Form, Input } from '@frontend/components/layout/Form';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';
import { Loader } from '@frontend/components/ui/Loader';
import { useTranslation } from '@frontend/contexts/translationContext';
import { setToLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import type { Project } from '@server/database/schemas/projects';
import { getProjectByCode } from '@server-actions/projects/get-project';

import { StudentQuestionChoice } from './StudentQuestionChoice';

export const LoginStudentForm = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [message, setMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [projectCode, setProjectCode] = React.useState('');
    const [project, setProject] = React.useState<Project | null>(null);

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setIsLoading(true);
        const project = await getProjectByCode(projectCode.trim());
        if (!project) {
            setMessage(t('join_page.errors.invalid_code'));
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
            setMessage(t('join_page.errors.invalid_code'));
            setIsLoading(false);
            return;
        }

        if (!project) {
            setMessage(t('join_page.errors.invalid_code'));
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
                        {t('join_page.header.title')}
                    </Title>
                    <Form className="login-form" onSubmit={onSubmit}>
                        {message && <span style={{ color: 'rgb(211, 47, 47)', display: 'block' }}>{message}</span>}
                        <Field
                            name="projectCode"
                            label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('join_page.project_code_field.label')}</span>}
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
                        <Button
                            label={t('join_page.submit_button.label')}
                            variant="contained"
                            color="secondary"
                            type="submit"
                            value="Submit"
                        ></Button>
                    </Form>
                </>
            )}
            <div className="text-center">
                <Link href="/login" className="color-primary">
                    {t('join_page.back_to_login_link.label')}
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </>
    );
};
