/**
 * Room Configurator bundle recommendations.
 *
 * Maps (room type × primary goal) -> a complete AV bundle of products
 * that an Aplus AV-integrator would actually quote together.
 *
 * Product IDs MUST exist in data/products.ts.
 */

import { Building2, GraduationCap, Presentation, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RoomTypeId = "huddle" | "boardroom" | "training" | "auditorium";
export type GoalId = "video-conferencing" | "collaboration" | "presentation";

export interface RoomTypeMeta {
  id: RoomTypeId;
  label: string;
  capacity: string;
  description: string;
  Icon: LucideIcon;
}

export interface GoalMeta {
  id: GoalId;
  label: string;
  description: string;
}

export interface BundleItem {
  productId: string;
  role: string;
  recommendedSize: string;
  reason: string;
}

export interface Bundle {
  title: string;
  summary: string;
  roomDimensions: string;
  attendees: string;
  items: BundleItem[];
}

export const ROOM_TYPES: RoomTypeMeta[] = [
  {
    id: "huddle",
    label: "Huddle Room",
    capacity: "3–6 people",
    description: "Small spontaneous-meeting space",
    Icon: Users,
  },
  {
    id: "boardroom",
    label: "Executive Boardroom",
    capacity: "8–14 people",
    description: "Premium decision-making space",
    Icon: Building2,
  },
  {
    id: "training",
    label: "Training Room",
    capacity: "15–30 people",
    description: "Instruction & workshop space",
    Icon: GraduationCap,
  },
  {
    id: "auditorium",
    label: "Auditorium / Town Hall",
    capacity: "50+ people",
    description: "Large-format presentation venue",
    Icon: Presentation,
  },
];

export const GOALS: GoalMeta[] = [
  {
    id: "video-conferencing",
    label: "Video Conferencing",
    description: "MS Teams / Zoom / Webex sessions",
  },
  {
    id: "collaboration",
    label: "Whiteboarding & Collaboration",
    description: "Brainstorms, design sprints, ideation",
  },
  {
    id: "presentation",
    label: "Passive Presentation",
    description: "Pitches, broadcasts, signage",
  },
];

export const BUNDLES: Record<RoomTypeId, Record<GoalId, Bundle>> = {
  huddle: {
    "video-conferencing": {
      title: "Huddle VC Bundle",
      summary:
        "A 55-inch Crystal UHD display paired with a Business TV that doubles as a confidence monitor — a clean two-screen setup for spontaneous Teams calls.",
      roomDimensions: "≈ 12 × 10 ft",
      attendees: "3–6",
      items: [
        {
          productId: "samsung-signage-qhc",
          role: "Main Display",
          recommendedSize: "55\"",
          reason: "4K UHD content + camera feed at conference-room legibility.",
        },
        {
          productId: "samsung-business-tv-bec-h",
          role: "Side Display",
          recommendedSize: "43\"",
          reason: "Confidence monitor for remote-participant gallery view.",
        },
      ],
    },
    collaboration: {
      title: "Huddle Collab Bundle",
      summary:
        "Flip 3 as the active whiteboard, with a slim QBC alongside for shared content — every member contributes from the same canvas.",
      roomDimensions: "≈ 12 × 10 ft",
      attendees: "3–6",
      items: [
        {
          productId: "samsung-interactive-flip-3",
          role: "Interactive Whiteboard",
          recommendedSize: "75\"",
          reason: "Pen-on-paper writing feel; ideal for quick ideation.",
        },
        {
          productId: "samsung-signage-qbc",
          role: "Side Display",
          recommendedSize: "50\"",
          reason: "Reference content + remote-participant view next to the whiteboard.",
        },
      ],
    },
    presentation: {
      title: "Huddle Presentation Bundle",
      summary:
        "Single Crystal UHD signage display — cost-effective canvas for pitches and team broadcasts in small rooms.",
      roomDimensions: "≈ 12 × 10 ft",
      attendees: "3–6",
      items: [
        {
          productId: "samsung-qet-series",
          role: "Main Display",
          recommendedSize: "55\"",
          reason: "16/7 4K UHD display with MagicINFO for one-click content rotation.",
        },
      ],
    },
  },
  boardroom: {
    "video-conferencing": {
      title: "Executive Boardroom VC Bundle",
      summary:
        "A 75\" QMC anchors the main view of remote participants, while a 75\" Flip Pro on a side cart supports annotation and document review without pausing the call.",
      roomDimensions: "≈ 20 × 14 ft",
      attendees: "8–14",
      items: [
        {
          productId: "samsung-signage-qmc",
          role: "Main Display",
          recommendedSize: "75\"",
          reason: "Ultra-slim 28.5mm QMC for premium boardroom aesthetics.",
        },
        {
          productId: "samsung-flip-pro-wm85b",
          role: "Interactive Whiteboard",
          recommendedSize: "75\"",
          reason: "20-touch USB-C-powered Flip Pro for live annotation during calls.",
        },
      ],
    },
    collaboration: {
      title: "Executive Boardroom Collab Bundle",
      summary:
        "A flagship 85\" Flip Pro for ideation, with a 75\" QMC for parallel data, decks, or dashboards — the Aplus signature boardroom configuration.",
      roomDimensions: "≈ 20 × 14 ft",
      attendees: "8–14",
      items: [
        {
          productId: "samsung-flip-pro-wm85b",
          role: "Interactive Whiteboard",
          recommendedSize: "85\"",
          reason: "Flagship 20-touch canvas with USB-C 65W charging.",
        },
        {
          productId: "samsung-signage-qmc",
          role: "Main Display",
          recommendedSize: "75\"",
          reason: "Side-by-side data display so the whiteboard never holds dual duty.",
        },
      ],
    },
    presentation: {
      title: "Executive Boardroom Presentation Bundle",
      summary:
        "Single statement 85\" QMC for client pitches and quarterly broadcasts — slim profile, even bezels, 24/7 ready.",
      roomDimensions: "≈ 20 × 14 ft",
      attendees: "8–14",
      items: [
        {
          productId: "samsung-signage-qmc",
          role: "Main Display",
          recommendedSize: "85\"",
          reason: "Premium 28.5mm slim profile sits cleanly on any boardroom wall.",
        },
      ],
    },
  },
  training: {
    "video-conferencing": {
      title: "Training Room VC Bundle",
      summary:
        "A 75\" QMC for the trainer feed, paired with a 75\" WAC for live interactive walkthroughs — works for hybrid training cohorts.",
      roomDimensions: "≈ 30 × 20 ft",
      attendees: "15–30",
      items: [
        {
          productId: "samsung-signage-qmc",
          role: "Main Display",
          recommendedSize: "75\"",
          reason: "4K UHD primary view of remote trainer / shared deck.",
        },
        {
          productId: "samsung-interactive-wac",
          role: "Interactive Display",
          recommendedSize: "75\"",
          reason: "20-touch Android AOSP board for live exercises.",
        },
      ],
    },
    collaboration: {
      title: "Training Room Collab Bundle",
      summary:
        "WAC interactive front-of-class with a 65\" QHC at the back for remote attendees and reference content — collaborative training that scales.",
      roomDimensions: "≈ 30 × 20 ft",
      attendees: "15–30",
      items: [
        {
          productId: "samsung-interactive-wac",
          role: "Interactive Display",
          recommendedSize: "75\"",
          reason: "Whole-class participation with Dual Pen + 9-screen share.",
        },
        {
          productId: "samsung-signage-qhc",
          role: "Side Display",
          recommendedSize: "65\"",
          reason: "Back-of-room companion display for late-arrivers and remote feed.",
        },
      ],
    },
    presentation: {
      title: "Training Room Presentation Bundle",
      summary:
        "A 75\" QHC primary display with a Flip 2 as an optional speaker-side whiteboard — lecture-style with light interactivity.",
      roomDimensions: "≈ 30 × 20 ft",
      attendees: "15–30",
      items: [
        {
          productId: "samsung-signage-qhc",
          role: "Main Display",
          recommendedSize: "75\"",
          reason: "Reliable Crystal UHD signage for long-format instruction.",
        },
        {
          productId: "samsung-flip-2",
          role: "Speaker Whiteboard",
          recommendedSize: "65\"",
          reason: "Light-touch annotation for trainer-led explanations.",
        },
      ],
    },
  },
  auditorium: {
    "video-conferencing": {
      title: "Auditorium VC Bundle",
      summary:
        "A 115\" QH115FX hero display for the room, with a 75\" QMC confidence monitor at the lectern — engineered for town halls and all-hands.",
      roomDimensions: "≈ 60+ ft deep",
      attendees: "50+",
      items: [
        {
          productId: "samsung-qh115fx",
          role: "Hero Display",
          recommendedSize: "115\"",
          reason: "1,000-nit direct-lit LED visible from the back row.",
        },
        {
          productId: "samsung-signage-qmc",
          role: "Confidence Monitor",
          recommendedSize: "75\"",
          reason: "Speaker-facing display for notes, timer, and remote gallery.",
        },
      ],
    },
    collaboration: {
      title: "Auditorium Collab Bundle",
      summary:
        "The 105\" QPDX 5K ultrawide anchors panel discussions, with an 85\" Flip Pro as a hot-swappable interactive whiteboard.",
      roomDimensions: "≈ 60+ ft deep",
      attendees: "50+",
      items: [
        {
          productId: "samsung-qpdx105",
          role: "Hero Display",
          recommendedSize: "105\"",
          reason: "5K 21:9 ultrawide for panels, data viz, and dual-presenter layouts.",
        },
        {
          productId: "samsung-flip-pro-wm85b",
          role: "Interactive Whiteboard",
          recommendedSize: "85\"",
          reason: "Roll-up interactive board for breakout sessions on the same stage.",
        },
      ],
    },
    presentation: {
      title: "Auditorium Presentation Bundle",
      summary:
        "A multi-panel VMB-R video wall delivers true large-format presence, with a QMC at the lectern as the speaker's reference display.",
      roomDimensions: "≈ 60+ ft deep",
      attendees: "50+",
      items: [
        {
          productId: "samsung-videowall-vmb-r",
          role: "Video Wall",
          recommendedSize: "2×2 or 3×3 (55\")",
          reason: "0.44mm bezel video wall scales to fill the stage wall.",
        },
        {
          productId: "samsung-signage-qmc",
          role: "Confidence Monitor",
          recommendedSize: "75\"",
          reason: "Speaker-side reference monitor at the lectern.",
        },
      ],
    },
  },
};
