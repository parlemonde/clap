'use server';

import * as React from 'react';

import { Container } from '@frontend/components/layout/Container';

import { LoginStudentForm } from './LoginStudentForm';

export default async function LoginPage() {
    return (
        <Container className="text-center">
            <LoginStudentForm />
        </Container>
    );
}
