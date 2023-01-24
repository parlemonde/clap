import React from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import CreateLogo from 'src/svg/create.svg';
import MoviesLogo from 'src/svg/movies.svg';
import SettingsLogo from 'src/svg/settings.svg';

const defaultTabs = [
    {
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
        label: 'create',
        path: '/create',
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'settings',
        path: '/settings',
    },
    {
        icon: <AccountCircleIcon style={{ fill: 'currentcolor' }} />,
        label: 'login',
        path: '/login',
    },
];

const userTabs = [
    {
        label: 'create',
        path: '/create',
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        label: 'my_videos',
        path: '/my-videos',
        icon: <MoviesLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'settings',
        path: '/settings',
    },
    {
        label: 'my_account',
        path: '/my-account',
        icon: <AccountCircleIcon fill="currentcolor" />,
    },
];

const adminTabs = [
    {
        label: 'app',
        path: '/create',
        icon: <div />,
    },
];

export const getTabs = (
    isLoggedIn: boolean,
    isAdmin: boolean,
    isOnAdminPages: boolean,
): Array<{
    icon: JSX.Element;
    label: string;
    path: string;
}> => {
    if (!isLoggedIn) {
        return defaultTabs;
    }

    if (isOnAdminPages) {
        return adminTabs;
    }

    if (isAdmin) {
        return [
            ...userTabs,
            {
                label: 'admin',
                path: '/admin/themes',
                icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
            },
        ];
    }
    return userTabs;
};
