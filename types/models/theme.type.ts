import type { Image } from './image.type';

export interface Theme {
    id: number | string;
    order: number;
    isDefault: boolean;
    names: { [key: string]: string };
    image: Image | null;
}
