import React from 'react';

import { TitleCard } from 'src/components/create/TitleCard';
import { Title } from 'src/components/layout/Typography';
import type { Sequence } from 'src/hooks/useLocalStorage/local-storage';

interface Scenario {
    sequence: Sequence;
    sequenceIndex: number;
    planStartIndex: number;
    onUpdateSequence?: (newSequence: Sequence) => void;
}

export const Scenario = ({ sequence, sequenceIndex, onUpdateSequence }: Scenario) => {
    return (
        <div>
            <Title color="primary" variant="h2" marginTop="lg" style={{ display: 'flex', alignItems: 'center' }}>
                {sequenceIndex + 1}. {sequence.question}
            </Title>
            <div className="plans">
                <TitleCard
                    questionIndex={sequenceIndex}
                    title={sequence.title}
                    onDelete={() => {
                        // setShowDeleteTitle(true);
                        const newSequence = { ...sequence, title: undefined };
                        onUpdateSequence?.(newSequence);
                    }}
                />
            </div>
        </div>
    );
};
