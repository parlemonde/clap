'use client';

import useSWR from 'swr';

import { jsonFetcher } from '@lib/json-fetcher';
import type { Language } from '@server/database/schemas/languages';

export function useLanguages(): Language[] {
    const { data } = useSWR<Language[], Error>('/api/languages', jsonFetcher);

    return data && data.length > 0
        ? data
        : [
              {
                  value: 'fr',
                  label: 'Français',
              },
          ];
}
