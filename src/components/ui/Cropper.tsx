/* eslint-disable @next/next/no-img-element */
import * as React from 'react';

import { KeepRatio } from 'src/components/layout/KeepRatio';
import { Modal } from 'src/components/layout/Modal';
import { sendToast } from 'src/components/ui/Toasts';
import { useTranslation } from 'src/contexts/translationContext';

const PRIMARY_COLOR = '#6065fc';
const CANVAS_ID = 'cropper-canvas';

interface CropperProps {
    ratio: number;
    imageUrl: string;
    isOpen: boolean;
    maxWidth?: number | string;
    onClose: () => void;
    onCrop: (data: Blob) => void;
}

export const Cropper = ({ ratio, imageUrl, isOpen, maxWidth = '800px', onClose, onCrop }: CropperProps) => {
    const { t } = useTranslation();
    const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });

    const [x, setX] = React.useState(0);
    const [y, setY] = React.useState(0);
    const [zoom, setZoom] = React.useState(1);

    const [isLoading, setIsLoading] = React.useState(false);

    // Reset position and zoom when closing the cropper
    if (!isOpen && (x !== 0 || y !== 0 || zoom !== 1)) {
        setX(0);
        setY(0);
        setZoom(1);
    }

    const [canvasWidth, setCanvasWidth] = React.useState(0);
    const [canvasHeight, setCanvasHeight] = React.useState(0);
    const resizeObserver = React.useMemo<ResizeObserver>(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.id === CANVAS_ID) {
                        setCanvasWidth(entry.contentRect.width);
                        setCanvasHeight(entry.contentRect.height);
                    }
                }
            }),
        [],
    );

    const onCanvasRef = React.useCallback(
        (canvas: HTMLDivElement | null) => {
            if (canvas) {
                resizeObserver.observe(canvas);
            } else {
                resizeObserver.disconnect();
            }
        },
        [resizeObserver],
    );

    const onMove = () => {
        if (zoom >= 1) {
            return; // Not able to move.
        }
        let newX = x;
        let newY = y;
        const onMouseMove = (event: MouseEvent) => {
            newX += event.movementX;
            newY += event.movementY;
            setX(Math.max(0, Math.min(canvasWidth - canvasWidth * zoom, newX)));
            setY(Math.max(0, Math.min(canvasHeight - canvasHeight * zoom, newY)));
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener(
            'mouseup',
            () => {
                document.removeEventListener('mousemove', onMouseMove);
            },
            { once: true },
        );
    };

    const onResize = (direction: 'nw' | 'ne' | 'se' | 'sw') => {
        const initialWidth = canvasWidth * zoom;
        const initialHeight = canvasHeight * zoom;
        let newWidth = initialWidth;
        let newHeight = initialHeight;
        const maxWidth = direction === 'ne' || direction === 'se' ? canvasWidth - x : x + initialWidth;
        const maxHeight = direction === 'se' || direction === 'sw' ? canvasHeight - y : y + initialHeight;
        const maxZoom = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight, 1);
        const onMouseMove = (event: MouseEvent) => {
            newWidth += event.movementX * (direction === 'ne' || direction === 'se' ? 1 : -1);
            newHeight += event.movementY * (direction === 'se' || direction === 'sw' ? 1 : -1);
            const newZoom = Math.max(newWidth / canvasWidth, newHeight / canvasHeight);
            const finalZoom = Math.min(maxZoom, Math.max(0.1, newZoom));
            const finalWidth = canvasWidth * finalZoom;
            const finalHeight = canvasHeight * finalZoom;
            const finalX = direction === 'ne' || direction === 'se' ? x : x + initialWidth - finalWidth;
            const finalY = direction === 'se' || direction === 'sw' ? y : y + initialHeight - finalHeight;
            setX(finalX);
            setY(finalY);
            setZoom(finalZoom);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener(
            'mouseup',
            () => {
                document.removeEventListener('mousemove', onMouseMove);
            },
            { once: true },
        );
    };

    const onConfirm = async () => {
        setIsLoading(true);
        try {
            if (!imageUrl || !imageSize.width || !imageSize.height) {
                throw new Error('Image not loaded');
            }

            // Draw image on canvas
            const imageRatio = imageSize.width / imageSize.height;
            const imageWidth = imageRatio > ratio ? imageSize.width : imageSize.height * ratio;
            const imageHeight = imageRatio > ratio ? imageSize.width / ratio : imageSize.height;
            const canvas = document.createElement('canvas');
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not create canvas context');
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const image = document.createElement('img');
            await new Promise((resolve) => {
                image.onload = () => {
                    resolve(undefined);
                };
                image.src = imageUrl;
            });
            ctx.drawImage(
                image,
                imageRatio > ratio ? 0 : (canvas.width - imageSize.width) / 2,
                imageRatio > ratio ? (canvas.height - imageSize.height) / 2 : 0,
            );

            // Crop image
            const xPct = x / canvasWidth;
            const yPct = y / canvasHeight;
            const newX = Math.round(xPct * imageWidth);
            const newY = Math.round(yPct * imageHeight);
            const width = Math.round(zoom * imageWidth);
            const height = Math.round(zoom * imageHeight);
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = width;
            croppedCanvas.height = height;
            const croppedCtx = croppedCanvas.getContext('2d');
            if (!croppedCtx) {
                throw new Error('Could not create cropped canvas context');
            }
            croppedCtx.drawImage(canvas, newX, newY, width, height, 0, 0, width, height);
            const blob = await new Promise<Blob | null>((resolve) => croppedCanvas.toBlob(resolve));
            if (blob) {
                onCrop(blob);
            } else {
                throw new Error('Could not create blob');
            }
        } catch (error) {
            console.error(error);
            sendToast({ message: 'Could not crop image...', type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        <Modal
            width="lg"
            title={t('part3_resize_image')}
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            confirmLabel={t('validate')}
            cancelLabel={t('cancel')}
            isLoading={isLoading}
        >
            <div style={{ width: '100%', maxWidth, margin: '0 auto', userSelect: 'none' }}>
                <KeepRatio ratio={1 / ratio} style={{ backgroundColor: 'grey', padding: '10px' }}>
                    <div
                        style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: 'black', boxSizing: 'border-box' }}
                        id={CANVAS_ID}
                        ref={onCanvasRef}
                    >
                        {/* image */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                onLoad={(event) => {
                                    const target = event.target;
                                    if (!(target instanceof HTMLImageElement)) {
                                        return;
                                    }
                                    setImageSize({ width: target.naturalWidth, height: target.naturalHeight });
                                }}
                            />
                        )}
                        {/* invisible overlay to prevent click through */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
                        {/* cropper */}
                        <div
                            style={{
                                width: canvasWidth * zoom,
                                height: canvasHeight * zoom,
                                border: `2px solid ${PRIMARY_COLOR}`,
                                boxSizing: 'border-box',
                                position: 'absolute',
                                top: y,
                                left: x,
                                cursor: 'move',
                            }}
                            onMouseDown={onMove}
                        >
                            {(['sw', 'se', 'nw', 'ne'] as const).map((direction) => (
                                <div
                                    key={direction}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: PRIMARY_COLOR,
                                        position: 'absolute',
                                        right: direction === 'ne' || direction === 'se' ? -5 : undefined,
                                        top: direction === 'ne' || direction === 'nw' ? -5 : undefined,
                                        left: direction === 'nw' || direction === 'sw' ? -5 : undefined,
                                        bottom: direction === 'se' || direction === 'sw' ? -5 : undefined,
                                        cursor: direction === 'ne' || direction === 'sw' ? 'nesw-resize' : 'nwse-resize',
                                        border: '1px solid black',
                                    }}
                                    onMouseDown={(event) => {
                                        event.stopPropagation();
                                        onResize(direction);
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </KeepRatio>
            </div>
        </Modal>
    );
};
