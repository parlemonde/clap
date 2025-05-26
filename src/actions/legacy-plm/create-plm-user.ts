'use server';

import type { PLMUser } from './plm-user.types';
import { db } from 'src/database';
import { users, type User } from 'src/database/schemas/users';

export async function createPlmUser(plmUser: PLMUser): Promise<User> {
    // Find role
    let role: User['role'] = 'teacher';
    const userGroups = plmUser.groups || [];
    if (userGroups.length > 1) {
        if (plmUser.groups.some((g) => parseInt(g.is_mod, 10) === 1) || plmUser.groups.some((g) => parseInt(g.is_admin, 10) === 1)) {
            role = 'admin';
        }
    }

    // Add user
    const user: Pick<User, 'role' | 'name' | 'email'> = {
        role,
        email: plmUser.email,
        name: plmUser.pseudo || '',
    };
    const [{ id }] = await db
        .insert(users)
        .values({ ...user, accountRegistration: 10, plmId: Number(plmUser.id) || null })
        .returning();
    return { ...user, id };
}
