'use client';

import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import NProgress from 'nprogress';
import * as React from 'react';

type LinkProps = Omit<Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps> & NextLinkProps, 'onCLick'>;

function isModifiedEvent(event: React.MouseEvent): boolean {
    const eventTarget = event.currentTarget;
    if (!(eventTarget instanceof HTMLAnchorElement)) {
        return true; // Should be an anchor element
    }

    const target = eventTarget.getAttribute('target');
    return (
        (target && target !== '_self') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey || // triggers resource download
        (event.nativeEvent && event.nativeEvent.button === 1)
    );
}

function shouldTriggerStartEvent(href: string, clickEvent: React.MouseEvent) {
    const current = window.location;
    const target = new URL(`${location.origin}${href}`);

    return !isModifiedEvent(clickEvent) && (current.pathname !== target.pathname || current.search !== target.search);
}

export const startNProgress = (href: LinkProps['href'], event: React.MouseEvent) => {
    if (!href || typeof href !== 'string' || !href.startsWith('/')) {
        return;
    }
    if (shouldTriggerStartEvent(href, event)) {
        NProgress.configure({ showSpinner: false });
        NProgress.start();
    }
};

const LinkWithRef = (props: React.PropsWithChildren<LinkProps>, ref: React.ForwardedRef<HTMLAnchorElement>) => {
    const innerRef = React.useRef<HTMLAnchorElement | null>(null);

    return (
        <NextLink
            onClick={props.legacyBehavior ? undefined : (event) => startNProgress(props.href, event)}
            {...props}
            prefetch={false}
            ref={(node) => {
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
                innerRef.current = node;
            }}
        />
    );
};

export const Link = React.forwardRef(LinkWithRef);
