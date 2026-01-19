import { LucideIcon } from 'lucide-react';

export interface Tab {
    id: string;
    icon: LucideIcon;
    language: string;
    label: string;
}

export interface Project {
    position: number;
    display_name: string;
    icon: string;
    type: string;
    stats?: {
        description?: string;
        language?: string;
        stars?: number;
        url?: string;
        readme?: string;
    };
}

export interface Experience {
    company: string;
    role: string;
    period: string;
    highlights: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    period: string;
    gpa?: string;
    honors?: string[];
}
