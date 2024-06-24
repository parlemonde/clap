import { UploadIcon } from '@radix-ui/react-icons';
import mergeImages from 'merge-images';
import React from 'react';
import type { CropperRef } from 'react-advanced-cropper';
import { Cropper } from 'react-advanced-cropper';

import { Button } from 'src/components/layout/Button';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { getMergeImagesParams, getMeta } from 'src/utils/crop-image';
import 'react-advanced-cropper/dist/style.css';

type ImageCropperProps = {
    image: string | null;
    setImage: (blob: Blob) => void;
};

export const ImageCropper: React.FunctionComponent<ImageCropperProps> = ({ image, setImage }: ImageCropperProps) => {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [imageBlob, setImageBlob] = React.useState<Blob | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cropperRef = React.useRef<CropperRef>(null);

    React.useEffect(() => {
        if (image) {
            fetch(image)
                .then((res) => res.blob())
                .then((blob) => setImageBlob(blob));
        }

        return () => {};
    }, [image]);

    const onImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);

            try {
                getMeta(url, (err, img) => {
                    if (err) throw new Error(err instanceof Event ? err.toString() : err);
                    if (img === null) return;

                    mergeImages(getMergeImagesParams(img, url)).then((base64: string) => setImageUrl(base64));
                });
            } catch (error) {
                console.error(error);
                setImageUrl(url);
            }
        } else {
            setImageUrl(null);
        }
    };

    const onImageUrlClear = () => {
        setImageUrl(null);
        if (inputRef.current !== undefined && inputRef.current !== null) {
            inputRef.current.value = '';
        }
    };

    const onSetImageBlob = async () => {
        if (imageUrl === null) return;
        try {
            if (cropperRef.current) {
                cropperRef.current.getCanvas()?.toBlob((blob) => {
                    if (blob) {
                        setImageBlob(blob);
                        setImage(blob);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
        onImageUrlClear();
    };

    return (
        <>
            <Title variant="h3" color="primary" marginTop="lg">
                Image :
            </Title>
            <div style={{ marginTop: '0.5rem' }}>{imageBlob && <img width="300px" src={window.URL.createObjectURL(imageBlob)} />}</div>
            <input id="theme-image-upload" ref={inputRef} type="file" style={{ display: 'none' }} onChange={onImageInputChange} accept="image/*" />
            <Button
                label={imageBlob ? "Changer d'image" : 'Choisir une image'}
                variant="outlined"
                color="secondary"
                as="label"
                isUpperCase={false}
                role="button"
                aria-controls="filename"
                tabIndex={0}
                onKeyPress={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        document.getElementById('theme-image-upload')?.click();
                    }
                }}
                htmlFor={'theme-image-upload'}
                leftIcon={<UploadIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
                marginTop="sm"
            ></Button>
            {imageBlob && (
                <Button
                    label="Supprimer l'image"
                    variant="outlined"
                    color="secondary"
                    marginTop="sm"
                    marginLeft="sm"
                    onClick={() => {
                        setImageBlob(null);
                    }}
                ></Button>
            )}

            {/* image modal */}
            <Modal
                isOpen={imageUrl !== null}
                onClose={onImageUrlClear}
                onConfirm={onSetImageBlob}
                confirmLabel="Valider"
                cancelLabel="Annuler"
                title="Redimensionner l'image"
                width="lg"
            >
                {imageUrl !== null && (
                    <div className="text-center">
                        <div style={{ width: '100%', height: '460px', marginBottom: '2rem', position: 'relative' }}>
                            <Cropper src={imageUrl} ref={cropperRef} />
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
