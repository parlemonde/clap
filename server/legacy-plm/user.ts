import { getRepository } from 'typeorm';

import { User, UserType } from '../entities/user';

export type PLM_User = {
    ID: string; // number in string
    user_login: string;
    user_nicename: string;
    user_email: string;
    user_registered: string; // date "YYYY-MM-DD HH:MM:SS",
    user_status: string; // number in string
    display_name: string;
    spam: string; // boolean in string ("0" or "1")
    deleted: string; // boolean in string ("0" or "1")
    first_name: string;
    groups: Array<{
        name: string; // village name
        id: string; // number in string, village id
        is_admin: string; // boolean in string ("0" or "1")
        is_mod: string; // boolean in string ("0" or "1")
        user_title: string;
    }>;
    meta: Array<{
        key: string;
        value: string; // can be a number
    }>;
    role: {
        id: string; // number in string. (country id?)
        title: string; // country
        key: string; // country as well
    };
    db_error: string;
};

function getMetaValue(plmUser: PLM_User, key: string): string {
    return (plmUser.meta ?? []).find((meta) => meta.key.toLowerCase() === key.toLowerCase())?.value ?? '';
}

export async function createPLMUserToDB(plmUser: PLM_User): Promise<User> {
    // Find type
    let userType = UserType.CLASS;
    const userGroups = (plmUser.groups || []).filter((g) => parseInt(g.id, 10) !== 2 && parseInt(g.id, 10) !== 10);
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
            where: { pseudo: plmUser.user_login },
        })) === 0;

    // Add user
    const user = new User();
    user.email = plmUser.user_email;
    user.pseudo = isPseudoAvailable ? plmUser.user_login : `user_${plmUser.user_login}`;
    user.school = getMetaValue(plmUser, 'Nom de votre école');
    user.languageCode = 'fr';
    user.type = userType;
    user.passwordHash = '';
    user.verificationHash = '';
    user.accountRegistration = 10;
    await getRepository(User).save(user);

    return user;
}
