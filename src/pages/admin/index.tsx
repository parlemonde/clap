import { useRouter } from 'next/router';
import React from 'react';

const AdminHomePage = () => {
    const router = useRouter();

    React.useEffect(() => {
        router.push('/admin/themes');
    }, [router]);

    return <div></div>;
};

export default AdminHomePage;
