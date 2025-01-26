import * as React from 'react';

import { getProjects } from 'src/actions/projects/get-projects';

export default async function SettingsPage() {
    const projects = await getProjects();
    return (
        <main>
            <h1>Mes videos</h1>
            {projects.map((project) => project.name).join(', ')}
        </main>
    );
}
