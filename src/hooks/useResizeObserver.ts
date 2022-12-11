import React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

type ElementRect = {
    x: number;
    y: number;
    width: number;
    height: number;
    scrollHeight: number;
    scrollWidth: number;
};

/**
 * Hook to return the position and dimensions of a component.
 * @param ref
 */
export const useResizeObserver = <T extends HTMLElement = HTMLElement>(): [React.MutableRefObject<T | null>, ElementRect] => {
    const [dimensions, setDimensions] = React.useState<ElementRect>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        scrollHeight: 0,
        scrollWidth: 0,
    });
    const observedNode = React.useRef<T | null>(null);
    const resizeObserver = React.useRef<ResizeObserver>();
    const animationFrame = React.useRef<number | null>(null);

    const onResize = React.useCallback(() => {
        if (!observedNode.current) {
            return;
        }
        const { x, y, width, height } = observedNode.current.getBoundingClientRect();
        setDimensions({
            x,
            y,
            width,
            height,
            scrollHeight: observedNode.current.scrollHeight,
            scrollWidth: observedNode.current.scrollWidth,
        });
    }, []);

    const onObserveResize = React.useCallback(() => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
        animationFrame.current = requestAnimationFrame(onResize);
    }, [onResize]);

    const removeObserver = React.useCallback(() => {
        if (resizeObserver.current) {
            resizeObserver.current.disconnect();
        }
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    }, []);

    const observeNode = React.useCallback(() => {
        removeObserver();
        if (observedNode.current === null) {
            return;
        }
        try {
            const observer = new ResizeObserver(onObserveResize);
            observer.observe(observedNode.current);
            resizeObserver.current = observer;
        } catch {
            removeObserver();
            return;
        }
    }, [removeObserver, onObserveResize]);

    // On mount, attach observer.
    // On unmount, detach observer.
    React.useEffect(() => {
        observeNode();
        return removeObserver;
    }, [observeNode, removeObserver]);

    return [observedNode, dimensions];
};
