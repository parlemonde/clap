'use server';

import { Table } from 'src/components/admin/Table';
import { CircularProgress } from 'src/components/layout/CircularProgress';

export const ThemesTablePlaceholder = async () => {
    return (
        <Table aria-label="tout les thèmes">
            <thead>
                <tr>
                    <th align="left">Ordre</th>
                    <th align="left">Nom</th>
                    <th align="left">Image</th>
                    <th align="right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th colSpan={4} align="center" style={{ padding: '8px 0' }}>
                        <CircularProgress size={24} />
                    </th>
                </tr>
            </tbody>
        </Table>
    );
};
