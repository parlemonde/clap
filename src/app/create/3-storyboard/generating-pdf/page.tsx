import { getExtracted } from 'next-intl/server';
import * as React from 'react';

import { Title } from '@frontend/components/layout/Typography';
import { Loader } from '@frontend/components/ui/Loader';

export default async function Page() {
    const t = await getExtracted('create.3-storyboard.generating-pdf');
    return (
        <div style={{ width: '100%', marginTop: '128px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Title>{t('Génération du PDF...')}</Title>
            <Loader isLoading />
        </div>
    );
}
