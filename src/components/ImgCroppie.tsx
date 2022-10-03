import 'croppie/croppie.css';
import Croppie from 'croppie';
import React, { forwardRef, memo, useEffect, useImperativeHandle } from 'react';

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
    { src, alt, imgWidth = 340, imgHeight = 260 }: ImgCroppieProps,
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
    useEffect(() => {
        const $el = document.getElementById('my-croppie-img');
        if ($el) {
            const newCroppie = new Croppie($el, {
                viewport: {
                    width: imgWidth,
                    height: imgHeight,
                    type: 'square',
                },
            });
            croppie.current = newCroppie;
            return () => {
                newCroppie.destroy();
                croppie.current = null;
            };
        }
        return () => {};
    }, [imgHeight, imgWidth]);

    return <img id="my-croppie-img" alt={alt} src={src} />;
};

export const ImgCroppie = memo(forwardRef(ImgCroppieComponent));
