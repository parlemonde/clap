import { redirect } from 'next/navigation';
import { getExtracted } from 'next-intl/server';

import { Container } from '@frontend/components/layout/Container';
import { Title } from '@frontend/components/layout/Typography';
import { Inverted } from '@frontend/components/ui/Inverted';
import { getCurrentUser } from '@server/auth/get-current-user';
import { listThemes } from '@server-actions/themes/list-themes';

import { Themes } from './Themes';

export default async function Page() {
    const user = await getCurrentUser();
    const themes = await listThemes({ userId: user?.id });
    const t = await getExtracted();

    if (user?.role === 'student') {
        redirect('/create/3-storyboard');
    }

    return (
        <Container paddingBottom="xl">
            <Title marginY="md">
                {t.rich('Sur quel <inverted>thème</inverted> sera votre vidéo ?', {
                    inverted: (chunks) => <Inverted>{chunks}</Inverted>,
                })}
            </Title>
            <Themes themes={themes} />
        </Container>
    );
}
