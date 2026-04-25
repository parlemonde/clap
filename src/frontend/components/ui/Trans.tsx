'use client';

import type { RichTranslationValues } from 'next-intl';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import type { TranslateOptions } from '@server/i18n/types';

export interface TransProps {
    i18nKey: string;
    i18nParams?: TranslateOptions;
}

function cloneRichChild(child: React.ReactNode, childIndex: number, chunks: React.ReactNode): React.ReactNode {
    if (!React.isValidElement(child)) {
        return chunks;
    }

    return React.cloneElement(child, { ...(child.props as React.PropsWithChildren), key: childIndex }, chunks);
}

export const Trans = ({ i18nKey, i18nParams = {}, children }: React.PropsWithChildren<TransProps>) => {
    const translator = useTranslations();
    const richValues = React.useMemo<RichTranslationValues>(() => {
        const values: RichTranslationValues = { ...i18nParams };

        React.Children.toArray(children).forEach((child, childIndex) => {
            if (!React.isValidElement(child)) {
                return;
            }

            values[`child${childIndex}`] = (chunks) => cloneRichChild(child, childIndex, chunks);

            if (typeof child.type === 'string' && values[child.type] === undefined) {
                values[child.type] = (chunks) => cloneRichChild(child, childIndex, chunks);
            }
        });

        return values;
    }, [children, i18nParams]);

    return <>{(translator.rich as (key: string, values?: RichTranslationValues) => React.ReactNode)(i18nKey, richValues)}</>;
};
