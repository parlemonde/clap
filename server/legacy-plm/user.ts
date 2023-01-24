import { getRepository } from 'typeorm';

import { User, UserType } from '../entities/user';

export type PLM_User = {
    id: string;
    email: string;
    peuso: string;
    school: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    groups: Array<{
        name: string; // village name
        id: string; // number in string, village id
        is_admin: string; // boolean in string ("0" or "1")
        is_mod: string; // boolean in string ("0" or "1")
        user_title: string;
    }>;
};

export async function createPLMUserToDB(plmUser: PLM_User): Promise<User> {
    // Find type
    let userType = UserType.CLASS;
    const userGroups = plmUser.groups || [];
    if (userGroups.length > 1) {
        if (plmUser.groups.some((g) => parseInt(g.is_mod, 10) === 1)) {
            userType = UserType.ADMIN;
        }
        if (plmUser.groups.some((g) => parseInt(g.is_admin, 10) === 1)) {
            userType = UserType.PLMO_ADMIN;
        }
    }

    // Check pseudo availability:
    const isPseudoAvailable =
        (await getRepository(User).count({
            where: { pseudo: plmUser.peuso },
        })) === 0;

    // Add user
    const user = new User();
    user.email = plmUser.email;
    user.pseudo = isPseudoAvailable ? plmUser.peuso : `user_${plmUser.peuso}`;
    user.school = plmUser.school || '';
    user.languageCode = 'fr';
    user.type = userType;
    user.passwordHash = '';
    user.verificationHash = '';
    user.accountRegistration = 10;
    await getRepository(User).save(user);

    delete user.passwordHash;
    delete user.verificationHash;
    return user;
}
