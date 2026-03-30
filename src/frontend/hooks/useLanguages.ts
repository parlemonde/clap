'use client';

import { jsonFetcher } from 'src/lib/json-fetcher';
import useSWR from 'swr';

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
