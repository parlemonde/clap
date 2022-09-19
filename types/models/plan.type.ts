import type { Image } from "./image.type";

export interface Plan {
  id: number;
  description: string;
  index: number;
  image: Image | null;
  url: string | null;
  duration: number | null;
}
