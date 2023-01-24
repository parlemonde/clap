export interface Scenario {
    id: number | string; // string for local scenarios.
    isDefault: boolean;
    names: Record<string, string>;
    descriptions: Record<string, string>;
    themeId: string | number;
    userId: number | null;
    questionsCount?: Record<string, number>;
}
