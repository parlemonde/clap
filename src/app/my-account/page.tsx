import * as React from 'react';

import { logout } from 'src/actions/authentication/logout';

export default function AccountPage() {
    return (
        <main>
            <h1>Mon compte</h1>
            <form action={logout}>
                <button type="submit">Logout</button>
            </form>
        </main>
    );
}
