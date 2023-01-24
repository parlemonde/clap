import React from 'react';

import type { User } from 'types/models/user.type';

type UserContext = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const userContext = React.createContext<UserContext>({
    user: null,
    setUser: () => {},
});

type UserContextProviderProps = {
    initialUser: User | null;
};
export const UserContextProvider = ({ initialUser, children }: React.PropsWithChildren<UserContextProviderProps>) => {
    const [user, setUser] = React.useState<User | null>(initialUser);

    const userContextValue = React.useMemo(() => ({ user, setUser }), [user]);
    return <userContext.Provider value={userContextValue}>{children}</userContext.Provider>;
};
