import {
  ZapIcon as Zap,
  MonitorIcon as Monitor,
  LayoutGridIcon as LayoutGrid,
  AwardIcon as Award,
} from "@/components/icons";
import { ElementType } from "react";
import type { CategorySlug } from "./categories";

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
    /**
     * Product categories to feature on the solution page, PRIMARY FIRST.
     * The featured-products grid leads with the primary category (top row) and
     * fills the rest from the secondary categories — see lib/solutionProducts.ts.
     * Replaces the old `recommendedSeries` substring match, which over-matched
     * (e.g. "VM" pulled in every VMB/VMC/VHC wall) and dropped drifted series.
     */
    featuredCategories: CategorySlug[];
}

export const solutions: Solution[] = [
    {
        id: "hospitality",
        slug: "hospitality",
        title: "Hospitality Display",
        subtitle: "Elevate the guest experience from check-in to check-out.",
        description: "Build guest loyalty and drive revenue with Samsung's premium hospitality displays, featuring stunning lobby video walls and personalized in-room entertainment.",
        benefits: [
            {
                title: "Guest Room TVs",
                description: "Deliver personalized content, streaming, and hotel services directly via in-room displays.",
                icon: Monitor,
            },
            {
                title: "Lobby Video Walls",
                description: "Create striking first impressions with seamless, high-brightness video walls.",
                icon: LayoutGrid,
            },
            {
                title: "Digital Concierge",
                description: "Deploy interactive kiosks for seamless self-check-in and intuitive wayfinding.",
                icon: Award,
            },
        ],
        // Guest-room / hotel TVs lead; then lobby signage, statement video walls, concierge kiosks.
        featuredCategories: ["commercial-tv", "digital-signage", "video-walls", "interactive"],
    },
    {
        id: "corporate",
        slug: "corporate",
        title: "Corporate & Workplace",
        subtitle: "Transform your workspace into a hub of modern collaboration.",
        description: "Enhance productivity across boardrooms, huddle spaces, and lobbies with Samsung's state-of-the-art corporate visual technology.",
        benefits: [
            {
                title: "Interactive Whiteboards",
                description: "Enable intuitive brainstorming and seamless hybrid conferencing with Samsung Flip Pro.",
                icon: Zap,
            },
            {
                title: "Boardroom Displays",
                description: "Ensure absolute clarity in presentations with crystal-clear UHD commercial displays.",
                icon: Monitor,
            },
            {
                title: "Operations Centers",
                description: "Deploy 24/7 mission-critical displays for demanding command and control environments.",
                icon: LayoutGrid,
            },
        ],
        // Samsung Flip / interactive meeting-room displays lead; then signage, control-room walls, reception TVs.
        featuredCategories: ["interactive", "digital-signage", "video-walls", "commercial-tv"],
    },
    {
        id: "education",
        slug: "education",
        title: "Education Solutions",
        subtitle: "Advanced interactive technology for the modern classroom.",
        description: "Empower educators and foster active student participation with touch-enabled displays and seamless device connectivity.",
        benefits: [
            {
                title: "Interactive Learning",
                description: "Drive engagement with multi-touch displays enabling simultaneous student collaboration.",
                icon: Zap,
            },
            {
                title: "Campus Signage",
                description: "Streamline campus communications with centralized digital bulletin boards and wayfinding.",
                icon: Monitor,
            },
            {
                title: "Hybrid Classrooms",
                description: "Seamlessly integrate video conferencing capabilities for robust remote learning.",
                icon: LayoutGrid,
            },
        ],
        // Interactive classroom displays lead; then campus signage, hostel/common-room TVs. (No video walls.)
        featuredCategories: ["interactive", "digital-signage", "commercial-tv"],
    },
    {
        id: "retail",
        slug: "retail",
        title: "Retail & Public Spaces",
        subtitle: "Captivate customers and accelerate retail sales.",
        description: "Attract and engage shoppers in crowded retail environments with high-impact visuals, vibrant colors, and dynamic digital content.",
        benefits: [
            {
                title: "Window Facing Displays",
                description: "Maximize storefront visibility with ultra-high-brightness panels engineered for direct sunlight.",
                icon: Zap,
            },
            {
                title: "In-Store Promotions",
                description: "Deploy targeted digital advertising networks to drive strategic in-store promotions.",
                icon: Award,
            },
            {
                title: "Menu Boards",
                description: "Streamline quick-service operations with automated, day-parted digital menu systems.",
                icon: LayoutGrid,
            },
        ],
        // Storefront / menu-board signage leads; then endless-aisle kiosks, flagship video walls, LED.
        featuredCategories: ["digital-signage", "interactive", "video-walls", "led-signage"],
    },
];
