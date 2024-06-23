import { Cross1Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { IconButton } from 'src/components/layout/Button/IconButton';
import { Input } from 'src/components/layout/Form';

type NameInputProps = {
    value?: string;
    language?: {
        label: string;
        value: string;
    };
    canDelete?: boolean;
    onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
    onDelete?(): void;
};
export const NameInput = ({
    value = '',
    language = { label: 'Français', value: 'fr' },
    canDelete = false,
    onChange = () => {},
    onDelete = () => {},
}: NameInputProps) => {
    return (
        <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center', marginTop: '4px' }}>
            <div style={{ marginRight: '8px', fontWeight: 'bold' }}>{language.label}</div>
            <Input size="sm" color="secondary" id={language.value} type="text" value={value} onChange={onChange} isFullWidth marginLeft="sm" />
            {canDelete && <IconButton icon={Cross1Icon} onClick={onDelete}></IconButton>}
        </div>
    );
};
