import { redirect } from 'next/navigation';

import { AdminDrawer } from '@frontend/components/navigation/AdminDrawer';
import { getCurrentUser } from '@server/auth/get-current-user';

export default async function AdminLayout({ children }: React.PropsWithChildren) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        redirect('/');
    }
    return (
        <>
            <AdminDrawer />
            <div>{children}</div>
        </>
    );
}
