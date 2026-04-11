'use server';

import { headers } from 'next/headers';
import { auth } from 'src/server/auth/auth';

import { getCurrentUser } from '@server/auth/get-current-user';
import type { User } from '@server/database/schemas/users';

type UpdateUserArgs = Pick<User, 'name' | 'email' | 'role'>;
export async function updateUser(id: string, partialUserUpdate: UpdateUserArgs): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin' || Object.keys(partialUserUpdate).length === 0) {
        return;
    }
    await auth.api.adminUpdateUser({
        body: {
            userId: id,
            data: { name: partialUserUpdate.name, email: partialUserUpdate.email },
        },
        headers: await headers(),
    });
    await auth.api.setRole({
        body: {
            userId: id,
            role: partialUserUpdate.role,
        },
        headers: await headers(),
    });
    return;
}
