'use client';

import * as React from 'react';

import { useTranslation } from 'src/contexts/translationContext';
import type { I18nKeys } from 'src/i18n/locales';

export interface TransProps {
    i18nKey: I18nKeys;
    i18nParams?: { [key: string]: string | number };
}

function getTranslatedChild(child: React.ReactNode, childIndex: number, str: string | null): React.ReactNode {
    if (typeof child === 'string') {
        return str;
    }
    if (React.isValidElement(child)) {
        const childChildren = (child.props as React.PropsWithChildren).children;
        return React.cloneElement(
            child,
            { ...(child.props as React.PropsWithChildren), key: childIndex },
            getTranslatedChild(childChildren, childIndex, str),
        );
    }
    return null;
}

export const Trans = ({ i18nKey, i18nParams = {}, children }: React.PropsWithChildren<TransProps>) => {
    const { t } = useTranslation();
    const translatedStrings = React.useMemo(() => {
        return t(i18nKey, i18nParams).split(/<\/?\w*?>/gm);
    }, [t, i18nKey, i18nParams]);

    const newChildren = (Array.isArray(children) ? (children as React.ReactNode[]) : [children])
        .slice(0, translatedStrings.length)
        .map((child, childIndex) => getTranslatedChild(child, childIndex, translatedStrings[childIndex]));
    return <>{newChildren}</>;
};
