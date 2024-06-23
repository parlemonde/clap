import { ChevronRightIcon } from '@radix-ui/react-icons';
import React from 'react';

import styles from './scenario-card.module.scss';
import { Placeholder } from 'src/components/layout/Placeholder';
import { Title } from 'src/components/layout/Typography';
import { Link } from 'src/components/navigation/Link';

type ScenarioCardProps = {
    isNew?: boolean;
    name: string;
    description?: string;
    questionsCount?: string;
    href: string;
};
export const ScenarioCard = ({ isNew = false, name, description, questionsCount, href }: ScenarioCardProps) => (
    <Link
        href={href}
        style={{
            backgroundColor: isNew ? '#f0fafa' : 'unset',
        }}
        className={styles.scenarioCard}
        tabIndex={0}
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
