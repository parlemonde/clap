'use server';

import * as React from 'react';

import { LoginStudentForm } from './LoginStudentForm';
import { Container } from 'src/components/layout/Container';

export default async function LoginPage() {
    return (
        <Container className="text-center">
            <LoginStudentForm />
        </Container>
    );
}
