'use client';
import * as React from 'react';
import type { JSX } from 'react';

import type { User } from 'src/database/schemas/users';
import type { I18nKeys } from 'src/i18n/locales';
import CreateLogo from 'src/svg/create.svg';
import MoviesLogo from 'src/svg/movies.svg';
import SettingsLogo from 'src/svg/settings.svg';

const UserIcon = (
    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M 7.5 1 C 3.912 1 1 3.912 1 7.5 s 2.912 6.5 6.5 6.5 s 6.5 -2.912 6.5 -6.5 S 11.088 1 7.5 1 z m 0 1.95 c 1.079 0 1.95 0.871 1.95 1.95 s -0.871 1.95 -1.95 1.95 s -1.95 -0.871 -1.95 -1.95 s 0.871 -1.95 1.95 -1.95 z m 0 9.23 c -1.625 0 -3.0615 -0.832 -3.9 -2.093 c 0.0195 -1.2935 2.6 -2.002 3.9 -2.002 c 1.2935 0 3.8805 0.7085 3.9 2.002 c -0.8385 1.261 -2.275 2.093 -3.9 2.093 z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
        ></path>
    </svg>
);

type Tab = {
    icon: JSX.Element | null;
    label: I18nKeys;
    path: string;
};

const defaultTabs: Tab[] = [
    {
        icon: <CreateLogo style={{ fill: 'currentcolor', height: '20px' }} />,
        label: 'common.navigation.create',
        path: '/',
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor', height: '20px' }} />,
        label: 'common.navigation.settings',
        path: '/settings',
    },
    {
        icon: UserIcon,
        label: 'common.navigation.login',
        path: '/login',
    },
];

const teacherTabs: Tab[] = [
    {
        label: 'common.navigation.create',
        path: '/',
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        label: 'common.navigation.my_videos',
        path: '/my-videos',
        icon: <MoviesLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'common.navigation.settings',
        path: '/settings',
    },
    {
        label: 'common.navigation.my_account',
        path: '/my-account',
        icon: UserIcon,
    },
];

const studentTabs: Tab[] = [
    {
        label: 'common.navigation.create',
        path: '/create/3-storyboard',
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'common.navigation.settings',
        path: '/settings',
    },
];

const adminTabs: Tab[] = [
    {
        label: 'common.navigation.app',
        path: '/',
        icon: null,
    },
];

export const getTabs = (userRole?: User['role'], isOnAdminPages: boolean = false): Tab[] => {
    if (!userRole) {
        return defaultTabs;
    }

    if (isOnAdminPages) {
        return adminTabs;
    }

    switch (userRole) {
        case 'student':
            return studentTabs;
        case 'teacher':
            return teacherTabs;
        case 'admin':
            return [
                ...teacherTabs,
                {
                    label: 'common.navigation.admin',
                    path: '/admin/themes',
                    icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
                },
            ];
    }

    // Should never happen
    return [];
};
