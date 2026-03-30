import { AdminDrawer } from '@frontend/components/navigation/AdminDrawer';

import { getCurrentUser } from '@server-actions/get-current-user';

export default async function AdminLayout({ children }: React.PropsWithChildren) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        return null;
    }
    return (
        <>
            <AdminDrawer />
            <div>{children}</div>
        </>
    );
}
