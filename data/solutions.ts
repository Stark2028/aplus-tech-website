import { Zap, Monitor, LayoutGrid, Award } from "lucide-react";
import { ElementType } from "react";

export interface Solution {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    // heroImage removed as per user request
    benefits: {
        title: string;
        description: string;
        icon: ElementType;
    }[];
    recommendedSeries: string[]; // e.g., ["QHC", "VMT"]
}

export const solutions: Solution[] = [
    {
        id: "hospitality",
        slug: "hospitality",
        title: "Hospitality Display",
        subtitle: "Elevate the Guest Experience from Check-in to checkout.",
        description: "Create unforgettable stays with Samsung's premium hospitality displays. From stunning lobby video walls to personalized in-room entertainment, our solutions help you build guest loyalty and drive revenue.",
        benefits: [
            {
                title: "Guest Room TVs",
                description: "Offer personalized content, streaming apps, and hotel services directly on the in-room screen.",
                icon: Monitor,
            },
            {
                title: "Lobby Video Walls",
                description: "Make a striking first impression with seamless, high-brightness LED video walls.",
                icon: LayoutGrid,
            },
            {
                title: "Digital Concierge",
                description: "Interactive kiosks for self-check-in, wayfinding, and local information.",
                icon: Award,
            },
        ],
        recommendedSeries: ["HBU", "HGU", "HG75", "AU", "BEFX", "BEA", "BEC", "BED", "QHC", "QMC", "QH115"],
    },
    {
        id: "corporate",
        slug: "corporate",
        title: "Corporate & Workplace",
        subtitle: "Transform your office into a hub of collaboration.",
        description: "Empower your workforce with state-of-the-art visual technology. Samsung's corporate solutions enhance productivity in boardrooms, huddle spaces, and lobbies.",
        benefits: [
            {
                title: "Interactive Whiteboards",
                description: "Samsung Flip Pro enables intuitive brainstorming and seamless video conferencing.",
                icon: Zap,
            },
            {
                title: "Boardroom Displays",
                description: "Crystal-clear UHD displays ensuring every presentation detail is visible.",
                icon: Monitor,
            },
            {
                title: "Operations Centers",
                description: "24/7 reliability for mission-critical command and control rooms.",
                icon: LayoutGrid,
            },
        ],
        recommendedSeries: ["Flip", "WAC", "WAD", "WAFX", "WAF", "QHC", "QMC", "QH115", "VMB", "VMC", "VHC", "VHB", "MP016"],
    },
    {
        id: "education",
        slug: "education",
        title: "Education Solutions",
        subtitle: "Interactive learning for the modern classroom.",
        description: "Engage students and empower teachers with Samsung's education displays. Foster active participation with touch-enabled screens and seamless device connectivity.",
        benefits: [
            {
                title: "Interactive Learning",
                description: "Touch displays that allow multiple students to write and draw simultaneously.",
                icon: Zap,
            },
            {
                title: "Campus Signage",
                description: "Keep students informed with digital bulletin boards and wayfinding.",
                icon: Monitor,
            },
            {
                title: "Hybrid Classrooms",
                description: "Video conferencing integration for remote learning capabilities.",
                icon: LayoutGrid,
            },
        ],
        recommendedSeries: ["Flip", "WAC", "WAD", "WAFX", "WAF", "QBC", "QBR", "QMR", "QMB"],
    },
    {
        id: "retail",
        slug: "retail",
        title: "Retail & Public Spaces",
        subtitle: "Captivate customers and drive sales.",
        description: "Stand out in crowded retail environments with high-impact visuals. Samsung's retail solutions deliver vibrant colors and dynamic content to attract and engage shoppers.",
        benefits: [
            {
                title: "Window Facing Displays",
                description: "High-brightness screens visible even in direct sunlight.",
                icon: Zap,
            },
            {
                title: "In-Store Promotions",
                description: "Targeted advertising and promotions on strategically placed screens.",
                icon: Award,
            },
            {
                title: "Menu Boards",
                description: "Dynamic digital menu boards for quick updates and appetizing visuals.",
                icon: LayoutGrid,
            },
        ],
        recommendedSeries: ["QHC", "QMC", "QBC", "QBR", "QH115", "QPDX", "QET", "QMR", "QMB", "MP016", "VMB", "VMC", "VHC", "VHB", "VH55R"],
    },
];
