import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as React from 'react';

import { IconButton } from '../Button/IconButton';
import styles from './checkbox.module.scss';
import CheckedIcon from 'src/svg/checkedIcon.svg';
import UncheckedIcon from 'src/svg/uncheckedIcon.svg';

type CheckboxProps = {
    name: string;
    label?: string;
    isChecked?: boolean;
    onChange?: (newIsChecked: boolean) => void;
};
export const Checkbox = ({ name, label, isChecked, onChange }: CheckboxProps) => {
    return (
        <div className={styles.Checkbox}>
            <RadixCheckbox.Root asChild checked={isChecked} onCheckedChange={onChange} id={name} name={name}>
                <IconButton
                    icon={isChecked ? CheckedIcon : UncheckedIcon}
                    variant="borderless"
                    marginRight="xs"
                    marginLeft={-8}
                    iconProps={{ width: 24, height: 24, color: isChecked ? '#6065fc' : 'rgba(0, 0, 0, 0.6)' }}
                />
            </RadixCheckbox.Root>
            {label && (
                <label className={styles.Checkbox__Label} htmlFor={name}>
                    {label}
                </label>
            )}
        </div>
    );
};
