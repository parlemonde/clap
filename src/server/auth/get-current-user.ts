import { headers } from 'next/headers';
import { cache } from 'react';

import type { User, UserRole } from '@server/database/schemas/users';

import { auth } from './auth';

const isValidUserRole = (role: string | null | undefined): role is UserRole => {
    return role !== null && role !== undefined && (role === 'admin' || role === 'teacher' || role === 'student');
};

export const getCurrentUser = cache(async (): Promise<User | undefined> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session ? { ...session.user, role: isValidUserRole(session.user.role) ? session.user.role : 'teacher' } : undefined;
});
