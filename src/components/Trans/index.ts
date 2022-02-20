import dynamic from 'next/dynamic';

export const Trans = dynamic(() => import('./Trans'), { ssr: false });
