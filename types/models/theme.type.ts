import type { Scenario } from './scenario.type';

export interface Theme {
    id: number | string; // string for local themes.
    order: number;
    isDefault: boolean;
    names: Record<string, string>;
    imageUrl: string | null;
    userId: number | null;
    scenarios?: Scenario[];
}
