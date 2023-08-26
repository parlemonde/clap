import * as React from 'react';

import styles from './backdrop.module.scss';

export const BackDrop = ({ children }: { children?: React.ReactNode }) => {
    return <div className={styles.backdrop}>{children}</div>;
};
