export enum UserType {
    CLASS = 0,
    ADMIN = 1,
    PLMO_ADMIN = 2,
}

export interface User {
    id: number;
    languageCode: string;
    email: string;
    pseudo: string;
    school: string;
    type: UserType;
    accountRegistration: number;
}
