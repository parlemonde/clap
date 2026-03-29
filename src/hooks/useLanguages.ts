'use client';

import type { Language } from 'src/database/schemas/languages';
import { jsonFetcher } from 'src/lib/json-fetcher';
import useSWR from 'swr';

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
