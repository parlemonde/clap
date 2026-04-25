'use client';

import React from 'react';

import type { User } from '@server/database/schemas/users';

export const userContext = React.createContext<User | undefined>(undefined);

type UserContextProviderProps = {
    user?: User;
};
export const UserContextProvider = ({ user, children }: React.PropsWithChildren<UserContextProviderProps>) => {
    return <userContext.Provider value={user}>{children}</userContext.Provider>;
};
