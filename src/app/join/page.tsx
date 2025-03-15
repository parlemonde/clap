'use server';

import * as React from 'react';

import { LoginStudentForm } from './LoginStudentForm';
import { Container } from 'src/components/layout/Container';
import { Title } from 'src/components/layout/Typography';

export default async function LoginPage() {
    return (
        <Container className="text-center">
            <Title color="primary" variant="h1" marginTop={48} marginBottom="lg">
                Rejoindre une session collaborative
            </Title>
            <LoginStudentForm />
        </Container>
    );
}
