export type PLMUser = {
    id: string;
    email: string;
    pseudo: string;
    groups: Array<{
        name: string; // village name
        id: string; // number in string, village id
        is_admin: string; // boolean in string ("0" or "1")
        is_mod: string; // boolean in string ("0" or "1")
        user_title: string;
    }>;
};
