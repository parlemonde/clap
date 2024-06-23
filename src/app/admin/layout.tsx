import { AdminDrawer } from 'src/components/navigation/AdminDrawer';

export default async function AdminLayout({ children }: React.PropsWithChildren) {
    return (
        <>
            <AdminDrawer />
            <div>{children}</div>
        </>
    );
}
