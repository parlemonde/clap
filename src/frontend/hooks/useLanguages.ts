'use client';

import useSWR from 'swr';

import { jsonFetcher } from '@lib/json-fetcher';
import type { LanguageOption } from '@server/database/schemas/languages';

export function useLanguages(): LanguageOption[] {
    const { data } = useSWR<LanguageOption[], Error>('/api/languages', jsonFetcher);

    return data && data.length > 0
        ? data
        : [
              {
                  value: 'fr',
                  label: 'Français',
              },
          ];
}
