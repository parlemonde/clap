import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { MobileView } from 'react-device-detect';
import { QrReader } from 'react-qr-reader';

import { Button } from 'src/components/layout/Button';
import { Container } from 'src/components/layout/Container';
import { Field, Form, Input } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';
import { sendToast } from 'src/components/ui/Toasts';
import { userContext } from 'src/contexts/userContext';
import { useSocket } from 'src/hooks/useSocket';
import { useTranslation } from 'src/i18n/useTranslation';
import { COLORS } from 'src/utils/colors';
import { httpRequest } from 'src/utils/http-request';
import { setToLocalStorage } from 'src/utils/local-storage';
import { serializeToQueryUrl } from 'src/utils/serializeToQueryUrl';
import type { Project } from 'types/models/project.type';
import type { User } from 'types/models/user.type';

const LoginPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { user, setUser } = React.useContext(userContext);

    const [isLoading, setIsLoading] = React.useState(false);
    const [showQrReader, setShowQrReader] = React.useState(false);
    const [joinCode, setJoinCode] = React.useState('');
    const [project, setProject] = React.useState<Project | undefined>(undefined);

    const { connectStudent } = useSocket();

    if (user !== null) {
        return <div></div>;
    }

    type StudentLoginReponse = {
        accessToken: string;
        projectId: number;
        sequencyId: number;
        teacherId: number;
        color: string;
        user: User;
    };
    type LoginStudentData = {
        projectId: number;
        sequencyId: number;
        teacherId: number;
    };
    const postLoginStudent = async (data: LoginStudentData) => {
        setIsLoading(true);
        const response = await httpRequest<never>({
            method: 'POST',
            url: `/login/student`,
            data,
        });
        if (response.success) {
            const data: StudentLoginReponse = response.data;
            setUser(data.user);
            setToLocalStorage('student', {
                projectId: data.projectId,
                sequencyId: data.sequencyId,
                teacherId: data.teacherId,
            });
            connectStudent(data.projectId, data.sequencyId);

            router.push(`/create/3-storyboard${serializeToQueryUrl({ projectId: data.projectId || null })}`);
        } else {
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
        setIsLoading(false);
    };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const QrReaderResult = async (result: any) => {
        if (result) {
            const loginData = JSON.parse(result);

            if (loginData.projectId && loginData.sequencyId && loginData.teacherId) {
                postLoginStudent({
                    projectId: loginData.projectId,
                    sequencyId: loginData.sequencyId,
                    teacherId: loginData.teacherId,
                });
            }
        }
    };

    // TODO: Remove this code before MEP - START
    // const testStudentLogin = async (e: Event) => {
    //     e.preventDefault();
    //     // change this with your ids to test
    //     postLoginStudent({
    //         projectId: 1,
    //         sequencyId: 1,
    //         teacherId: 2,
    //     });
    // };
    // TODO: Remove this code before MEP - STOP

    const toggleShowQrReader = () => {
        setShowQrReader(!showQrReader);
    };

    const getProject = async () => {
        const projectResponse = await httpRequest<Project>({
            method: 'GET',
            url: `/projects/join/${joinCode}`,
        });
        if (projectResponse.success) {
            setProject(projectResponse.data);
        } else {
            setProject(undefined);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    return (
        <Container
            className="text-center join-page"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                {t(`collaboration_join_${project === undefined ? '' : 'sequency_'}title`)}
            </Title>

            {project === undefined && (
                <Form className="login-form" onSubmit={getProject}>
                    <Field
                        name="joinCode"
                        label={<span style={{ display: 'inline-block', marginBottom: 4 }}>{t('collaboration_join_code')}</span>}
                        input={
                            <Input
                                id="joinCode"
                                name="joinCode"
                                type="number"
                                min={0}
                                max={999999}
                                color="secondary"
                                value={joinCode}
                                onChange={(event) => {
                                    setJoinCode(event.target.value);
                                }}
                                isFullWidth
                                required
                            />
                        }
                    ></Field>
                    <Button label="Rejoindre" variant="contained" color="secondary" type="submit" value="Submit"></Button>
                    {/* // TODO: Remove this code before MEP - START */}
                    {/* <Button
                        variant="outlined"
                        color="secondary"
                        type="submit"
                        value="button"
                        onClick={testStudentLogin}
                        label="Simulation de connexion par QRCode"
                    ></Button> */}
                    {/* // TODO: Remove this code before MEP - STOP */}
                    <MobileView>
                        <Button
                            variant="outlined"
                            color="secondary"
                            type="button"
                            onClick={toggleShowQrReader}
                            label={t(`collaboration_qrcode_scan_${showQrReader ? 'hide' : 'show'}`)}
                        ></Button>
                        {showQrReader && <QrReader onResult={QrReaderResult} constraints={{ facingMode: 'environment' }} />}
                    </MobileView>
                </Form>
            )}
            {project !== undefined && project.questions && (
                <div className="sequency-list">
                    {project.questions.map((q, index) => {
                        return (
                            <div
                                className="sequency-list__item"
                                onClick={() => postLoginStudent({ projectId: project.id, sequencyId: q.id, teacherId: project?.userId || 0 })}
                                key={index}
                            >
                                <p>{t('collaboration_join_sequency_number', { sequency: index + 1 })}</p>
                                <div style={{ height: '150px', width: '150px', backgroundColor: COLORS[index] }}></div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="text-center">
                <Link href="/login" className="color-primary">
                    {t('login_back')}
                </Link>
            </div>
            <Loader isLoading={isLoading} />
        </Container>
    );
};

export default LoginPage;
