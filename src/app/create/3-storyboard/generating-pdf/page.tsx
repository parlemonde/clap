import { getTranslations } from 'next-intl/server';
import * as React from 'react';

import { Title } from '@frontend/components/layout/Typography';
import { Loader } from '@frontend/components/ui/Loader';

export default async function Page() {
    const t = await getTranslations();
    return (
        <div style={{ width: '100%', marginTop: '128px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Title>{t('3_generating_pdf_page.title')}</Title>
            <Loader isLoading />
        </div>
    );
}
