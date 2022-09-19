import { useRouter } from 'next/router';
import React from 'react';

const HomePage: React.FunctionComponent = () => {
    const router = useRouter();

    React.useEffect(() => {
        router.push('/create');
    }, [router]);
    return <div></div>;
};

export default HomePage;
