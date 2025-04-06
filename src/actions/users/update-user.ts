'use server';

import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

import { getCurrentUser } from '../get-current-user';
import { db } from 'src/database';
import type { User } from 'src/database/schemas/users';
import { users } from 'src/database/schemas/users';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

interface UpdateUserArgs {
    name?: string;
    email?: string;
    password?: string;
    oldPassword?: string;
}

export async function updateUser(updatedUser: UpdateUserArgs): Promise<void> {
    const user = await getCurrentUser();

    if (!user) {
        return;
    }

    const updatableValues: {
        name?: string;
        email?: string;
        passwordHash?: string;
    } = {
        name: updatedUser.name,
        email: updatedUser.email,
    };

    if (updatedUser.oldPassword !== undefined && updatedUser.password !== undefined && PASSWORD_REGEX.test(updatedUser.password)) {
        const userPasswordHash =
            (await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)))[0]?.passwordHash ?? '';
        const isValidOldPassword = userPasswordHash && (await verify(userPasswordHash.trim(), updatedUser.oldPassword));
        if (isValidOldPassword) {
            updatableValues.passwordHash = await hash(updatedUser.password);
        }
    }

    if (Object.values(updatableValues).some((v) => !!v)) {
        await db.update(users).set(updatableValues).where(eq(users.id, user?.id));
    }
}

type UpdateUserByIdArgs = Pick<User, 'name' | 'email' | 'role'>;
export async function updateUserById(id: number, partialUserUpdate: UpdateUserByIdArgs): Promise<void> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin' || Object.keys(partialUserUpdate).length === 0) {
        return;
    }
    await db.update(users).set(partialUserUpdate).where(eq(users.id, id));
}
