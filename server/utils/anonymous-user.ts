import { UserType } from '../entities/user';
import type { User } from '../entities/user';

export const ANONYMOUS_USER: User = {
    id: 0,
    languageCode: 'fr',
    email: '',
    pseudo: 'Anonymous',
    school: '',
    type: UserType.STUDENT,
    accountRegistration: 0,
};
