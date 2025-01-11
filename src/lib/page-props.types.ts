import type { SearchParams } from './search-params/search-params.types';

export interface ServerPageProps {
    searchParams: Promise<SearchParams>;
    params: Promise<{ [key: string]: string }>;
}
