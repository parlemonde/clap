import { ChevronRightIcon } from '@radix-ui/react-icons';
import React from 'react';

import { Placeholder } from '@frontend/components/layout/Placeholder';
import { Title } from '@frontend/components/layout/Typography';
import { Link } from '@frontend/components/navigation/Link';

import styles from './scenario-card.module.scss';

type ScenarioCardProps = {
    isNew?: boolean;
    name: string;
    description?: string;
    questionsCount?: string;
    href: string;
    onClick?: (event: React.MouseEvent) => void;
};
export const ScenarioCard = ({ isNew = false, name, description, questionsCount, href, onClick }: ScenarioCardProps) => (
    <Link
        href={href}
        style={{
            backgroundColor: isNew ? '#f0fafa' : 'unset',
        }}
        className={styles.scenarioCard}
        tabIndex={0}
        onClick={onClick}
    >
        <Title variant="h3" color="primary">
            {name}
        </Title>
        <p>{description}</p>
        {questionsCount && <div style={{ color: '#646464' }}>{questionsCount}</div>}
        <div className={styles.scenarioCard__arrow}>{<ChevronRightIcon style={{ color: '#646464' }} />}</div>
    </Link>
);

export const ScenarioCardPlaceholder = () => <Placeholder height="40px" className={styles.scenarioCard} />;
