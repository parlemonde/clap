import * as React from 'react';

import { Title } from 'src/components/layout/Typography';
import { Loader } from 'src/components/ui/Loader';

export default async function Page() {
    return (
        <div style={{ width: '100%', marginTop: '128px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Title>Génération du PDF...</Title>
            <Loader isLoading />
        </div>
    );
}
