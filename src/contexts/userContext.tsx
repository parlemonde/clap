'use client';

import React from 'react';

import { logout } from 'src/actions/authentication/logout';
import type { User } from 'src/database/schemas/users';

type UserContext = {
    user?: User;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
};

export const userContext = React.createContext<UserContext>({
    user: undefined,
    setUser: () => {},
});

type UserContextProviderProps = {
    initialUser?: User;
    isSessionExpired?: boolean;
};
export const UserContextProvider = ({ initialUser, isSessionExpired, children }: React.PropsWithChildren<UserContextProviderProps>) => {
    const [user, setUser] = React.useState<User | undefined>(initialUser);

    if (user?.id !== initialUser?.id) {
        setUser(initialUser);
    }

    React.useEffect(() => {
        if (isSessionExpired) {
            logout().catch(console.error);
        }
    }, [isSessionExpired]);

    const userContextValue = React.useMemo(() => ({ user, setUser }), [user]);
    return <userContext.Provider value={userContextValue}>{children}</userContext.Provider>;
};
