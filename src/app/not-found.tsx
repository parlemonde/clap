import * as React from 'react';

import { Link } from '@frontend/components/navigation/Link';

export default function NotFound() {
    return (
        <div>
            <h2>Page non trouvée</h2>
            <Link href="/">Accueil</Link>
        </div>
    );
}
