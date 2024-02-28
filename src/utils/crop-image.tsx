import type { Area } from 'react-easy-crop';

export const getMeta = (url: string, cb: (e: string | Event | null, i: HTMLImageElement | null) => void) => {
    const img = new Image();
    img.onload = () => cb(null, img);
    img.onerror = (err) => cb(err, null);
    img.src = url;
};

export const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);

    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation: number = 0, flip = { horizontal: false, vertical: false }) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');

    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        return null;
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

    // As Base64 string
    // return croppedCanvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise<Blob | null>((resolve) => {
        croppedCanvas.toBlob((blob) => resolve(blob));
        // croppedCanvas.toBlob((file) => {
        //         resolve(URL.createObjectURL(file));
        // }, 'image/jpeg');
    });
}

type MERGE_IMAGE = { src: string; x: number; y: number };

const MERGE_IMAGE_OPTIONS: MERGE_IMAGE[] = [
    { src: '/black_bg/black_1600x900.jpg', x: 1600, y: 900 },
    { src: '/black_bg/black_1920x1080.jpg', x: 1920, y: 1080 },
    { src: '/black_bg/black_2560x1440.jpg', x: 2560, y: 1440 },
    { src: '/black_bg/black_3840x2160.jpg', x: 3840, y: 2160 },
    { src: '/black_bg/black_7680x4320.jpg', x: 7680, y: 4320 },
];

export const getMergeImagesParams = (img: HTMLImageElement, url: string): MERGE_IMAGE[] => {
    let option: MERGE_IMAGE = MERGE_IMAGE_OPTIONS[0];

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (imgWidth > 3840 || imgHeight > 2160) {
        option = MERGE_IMAGE_OPTIONS[4];
    } else if (imgWidth > 2560 || imgHeight > 1440) {
        option = MERGE_IMAGE_OPTIONS[3];
    } else if (imgWidth > 1920 || imgHeight > 1080) {
        option = MERGE_IMAGE_OPTIONS[2];
    } else if (imgWidth > 1600 || imgHeight > 900) {
        option = MERGE_IMAGE_OPTIONS[1];
    }

    return [
        { src: option.src, x: 0, y: 0 },
        {
            src: url,
            x: imgWidth < option.x ? (option.x - imgWidth) / 2 : 0,
            y: imgHeight < option.y ? (option.y - imgHeight) / 2 : 0,
        },
    ];
};
