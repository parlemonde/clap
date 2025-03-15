import { getCurrentUser } from 'src/actions/get-current-user';
import { AdminDrawer } from 'src/components/navigation/AdminDrawer';

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
