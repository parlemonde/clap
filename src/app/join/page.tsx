'use server';

import * as React from 'react';
import { Container } from 'src/components/layout/Container';

import { LoginStudentForm } from './LoginStudentForm';

export default async function LoginPage() {
    return (
        <Container className="text-center">
            <LoginStudentForm />
        </Container>
    );
}
