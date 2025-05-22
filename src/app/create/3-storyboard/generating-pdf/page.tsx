import * as React from 'react';

import { getTranslation } from 'src/actions/get-translation';
import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';

export default async function Page() {
    const { t } = await getTranslation();
    return (
        <div style={{ width: '100%', marginTop: '128px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Title>{t('3_generating_pdf_page.title')}</Title>
            <Loader isLoading />
        </div>
    );
}
