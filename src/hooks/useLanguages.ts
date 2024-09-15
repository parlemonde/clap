'use client';

import useSWR from 'swr';

import type { Language } from 'src/database/schemas/languages';
import { jsonFetcher } from 'src/utils/json-fetcher';

export function useLanguages(): Language[] {
    const { data } = useSWR<Language[], Error>('/api/languages', jsonFetcher);

    return data ?? [];
}
