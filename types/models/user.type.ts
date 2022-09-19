export enum UserType {
    CLASS = 0,
    ADMIN = 1,
    PLMO_ADMIN = 2,
}

export interface User {
    id: number;
    languageCode: string;
    // managerLastName: string;
    // managerFirstName: string;
    email: string;
    level: string;
    pseudo: string;
    school: string;
    type: UserType;
    accountRegistration: number;
    password?: string;
    passwordConfirm?: string;
}
