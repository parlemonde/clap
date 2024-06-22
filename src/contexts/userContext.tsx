'use client';

import React from 'react';

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
};
export const UserContextProvider = ({ initialUser, children }: React.PropsWithChildren<UserContextProviderProps>) => {
    const [user, setUser] = React.useState<User | undefined>(initialUser);

    if (user?.id !== initialUser?.id) {
        setUser(initialUser);
    }

    const userContextValue = React.useMemo(() => ({ user, setUser }), [user]);
    return <userContext.Provider value={userContextValue}>{children}</userContext.Provider>;
};
