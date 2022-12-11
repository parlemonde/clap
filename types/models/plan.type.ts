export interface Plan {
    id: number;
    description: string;
    index: number;
    imageUrl: string | null;
    questionId?: number;
    // --- slideshow attributes ---
    duration: number | null;
}
