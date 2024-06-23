'use client';

import 'croppie/croppie.css';
import Croppie from 'croppie';
import React, { forwardRef, useImperativeHandle } from 'react';

interface ImgCroppieProps {
    src: string;
    alt: string;
    imgWidth?: number;
    imgHeight?: number;
}

export interface ImgCroppieRef {
    getBlob(): Promise<Blob | null>;
}

const ImgCroppieComponent: React.ForwardRefRenderFunction<ImgCroppieRef, ImgCroppieProps> = (
    { src, alt, imgWidth = 340, imgHeight = 340 }: ImgCroppieProps,
    ref: React.Ref<ImgCroppieRef>,
) => {
    const croppie = React.useRef<Croppie | null>(null);

    useImperativeHandle(ref, () => ({
        async getBlob() {
            if (croppie.current === null) {
                return null;
            }
            return await croppie.current.result({
                type: 'blob',
                format: 'jpeg',
                circle: false,
            });
        },
    }));

    // init croppie
    const initializedForDimensions = React.useRef('');
    React.useEffect(() => {
        const dimensions = `${imgWidth}-${imgHeight}`;
        if (initializedForDimensions.current === dimensions) {
            return;
        }
        initializedForDimensions.current = dimensions;

        const $el = document.getElementById('my-croppie-img');
        if ($el) {
            if (croppie.current) {
                croppie.current.destroy();
            }
            croppie.current = new Croppie($el, {
                viewport: {
                    width: imgWidth,
                    height: imgHeight,
                    type: 'square',
                },
            });
        }
    }, [imgHeight, imgWidth]);

    // Destroy croppie on unmount
    React.useEffect(() => {
        return () => {
            if (document.getElementById('my-croppie-img') === null && croppie.current) {
                croppie.current.destroy();
                croppie.current = null;
            }
        };
    }, []);

    // eslint-disable-next-line @next/next/no-img-element
    return <img id="my-croppie-img" alt={alt} src={src} />;
};

export const ImgCroppie = forwardRef(ImgCroppieComponent);
