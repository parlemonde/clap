export interface Title {
    text: string;
    duration: number;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
}
export interface Plan {
    id: number;
    description: string;
    imageUrl: string;
    duration: number;
}
export interface Sequence {
    id: number;
    question: string;
    plans: Plan[];
    title?: Title;
    voiceText?: string;
    soundUrl?: string;
    soundVolume?: number;
    voiceOffBeginTime?: number;
    status?: 'storyboard' | 'storyboard-validating' | 'pre-mounting' | 'pre-mounting-validating' | 'validated';
    feedbacks?: string[];
}
