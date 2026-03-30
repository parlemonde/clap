'use client';

import * as React from 'react';

import { AdminTile } from '@frontend/components/admin/AdminTile';
import { Table } from '@frontend/components/admin/Table';

import type { Theme } from '@server/database/schemas/themes';

type UserThemesTableProps = {
    userThemes: Theme[];
};

export const UserThemesTable = ({ userThemes }: UserThemesTableProps) => {
    if (userThemes.length === 0) {
        return null;
    }

    return (
        <AdminTile title="Thèmes des utilisateurs" marginY="xl">
            <Table aria-label="tout les thèmes">
                <tbody>
                    {userThemes.map((t) => (
                        <tr key={t.id}>
                            <th style={{ padding: '8px 16px' }}>{Object.values(t.names)[0]}</th>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </AdminTile>
    );
};
