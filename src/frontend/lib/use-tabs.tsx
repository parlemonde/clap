'use client';
import { useExtracted } from 'next-intl';
import * as React from 'react';
import type { JSX } from 'react';

import CreateLogo from '@frontend/svg/create.svg';
import MoviesLogo from '@frontend/svg/movies.svg';
import SettingsLogo from '@frontend/svg/settings.svg';
import type { User } from '@server/database/schemas/users';

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

type TabDefinition = {
    icon: JSX.Element | null;
    label: 'create' | 'my-videos' | 'settings' | 'login' | 'app' | 'admin' | 'my-account';
    path: string;
};

type Tab = {
    icon: JSX.Element | null;
    label: string;
    path: string;
};

const defaultTabs: TabDefinition[] = [
    {
        icon: <CreateLogo style={{ fill: 'currentcolor', height: '20px' }} />,
        label: 'create',
        path: '/',
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor', height: '20px' }} />,
        label: 'settings',
        path: '/settings',
    },
    {
        icon: UserIcon,
        label: 'login',
        path: '/login',
    },
];

const teacherTabs: TabDefinition[] = [
    {
        label: 'create',
        path: '/',
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        label: 'my-videos',
        path: '/my-videos',
        icon: <MoviesLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'settings',
        path: '/settings',
    },
    {
        label: 'my-account',
        path: '/my-account',
        icon: UserIcon,
    },
];

const studentTabs: TabDefinition[] = [
    {
        label: 'create',
        path: '/create/3-storyboard',
        icon: <CreateLogo style={{ fill: 'currentcolor' }} />,
    },
    {
        icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
        label: 'settings',
        path: '/settings',
    },
];

const adminTabs: TabDefinition[] = [
    {
        label: 'app',
        path: '/',
        icon: null,
    },
];

const getTabs = (userRole?: User['role'], isOnAdminPages: boolean = false): TabDefinition[] => {
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
                    label: 'admin',
                    path: '/admin/themes',
                    icon: <SettingsLogo style={{ fill: 'currentcolor' }} />,
                },
            ];
    }

    // Should never happen
    return [];
};

export const useTabs = (userRole?: User['role'], isOnAdminPages: boolean = false): Tab[] => {
    const commonT = useExtracted('common');
    const tabs = getTabs(userRole, isOnAdminPages);

    return React.useMemo(
        () =>
            tabs.map((tab) => {
                switch (tab.label) {
                    case 'create':
                        return { ...tab, label: commonT('Créer') };
                    case 'my-videos':
                        return { ...tab, label: commonT('Mes vidéos') };
                    case 'settings':
                        return { ...tab, label: commonT('Réglages') };
                    case 'login':
                        return { ...tab, label: commonT('Je me connecte !') };
                    case 'app':
                        return { ...tab, label: commonT('Application') };
                    case 'admin':
                        return { ...tab, label: commonT('Admin') };
                    case 'my-account':
                        return { ...tab, label: commonT('Mon compte') };
                }
            }),
        [commonT, tabs],
    );
};
