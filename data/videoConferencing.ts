import type { Product } from "@/data/products";

/**
 * Curated Logitech video-conferencing catalog (16 products).
 *
 * POSITIONING (see docs/superpowers/specs/2026-07-18-logitech-video-conferencing-design.md):
 * Aplus resells genuine Logitech products (nominative fair use) but is NOT an
 * authorized Logitech partner. Therefore NOTHING in this file may contain the
 * words "authorized", "partner", or "certified", nor claim a sourcing channel
 * or Logitech India warranty. The trust story is Aplus's own supply,
 * installation and AMC support. Specs are sourced from logitech.com.
 *
 * brand is always "Logitech"; catalog2026 is intentionally never set (it means
 * the 2026 SAMSUNG catalog). series holds the product-family label so every
 * series-driven surface (card SKU line, compare header, spec-sheet title,
 * lead-gate copy) reads naturally.
 */
export const videoConferencingProducts: Product[] = [
  // ── Video Bars & Systems ──────────────────────────────────────────────
  {
    id: "logitech-rally-board-65",
    brand: "Logitech",
    name: "Logitech Rally Board 65",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "All-in-one 65-inch 4K touchscreen collaboration board with a built-in camera, mics and speakers that runs Microsoft Teams Rooms and Zoom Rooms without an external PC.",
    longDescription: `Logitech Rally Board 65 is an all-in-one collaboration board that combines a 65-inch 4K touchscreen, a wide-angle camera, a beamforming mic array and speakers in a single wall-mounted or cart-mounted device. It runs Microsoft Teams Rooms on Android and Zoom Rooms Appliances out of the box, so a meeting joins with one touch — no room PC required.

Rally Board 65 doubles as a digital whiteboard for in-room and remote collaboration, with AI framing that keeps everyone in view. Aplus Technology Solutions supplies, installs and maintains Rally Board 65 deployments across India with GST invoicing and AMC support.`,
    features: [
      "65-inch UHD 4K touchscreen with 20-point IR touch",
      "Runs Microsoft Teams Rooms & Zoom Rooms on-device (no room PC)",
      "Built-in wide-angle camera with AI auto-framing",
      "Integrated beamforming mics and speakers",
      "Digital whiteboarding for in-room and remote teams",
    ],
    specs: {
      resolution: "3840 × 2160 (4K UHD)",
      brightness: "400 nit",
      screenSizes: ["65"],
      operationTime: "Large Rooms",
    },
    specGroups: {
      Display: {
        "Diagonal Size": '65"',
        "Panel Type": "LCD (IPS)",
        Resolution: "3840 × 2160 (4K UHD)",
        "Brightness (Typical)": "400 nit",
        "Aspect Ratio": "16:9",
        Touch: "IR-based, 20-point multi-touch",
        Coatings: "Anti-glare, anti-fingerprint",
      },
      "Camera & AI": {
        "Camera Resolution": "4K UHD",
        Framing: "AI auto-framing and speaker tracking",
      },
      "Compute & Platform": {
        Modes: "Appliance (Microsoft Teams Rooms / Zoom Rooms)",
        OS: "Logitech CollabOS",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-board-65/1.webp"],
  },
  {
    id: "logitech-rally-bar",
    brand: "Logitech",
    name: "Logitech Rally Bar",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "All-in-one video bar for medium to large rooms, with a motorized PTZ camera, AI auto-framing and built-in compute for Microsoft Teams Rooms and Zoom Rooms.",
    longDescription: `Logitech Rally Bar is a premium all-in-one video bar built for medium to large meeting rooms. It combines a motorized PTZ camera, a beamforming mic array and integrated speakers in a single device, with on-device AI that frames and follows active speakers automatically.

Rally Bar runs Microsoft Teams Rooms or Zoom Rooms on Android without an external PC in appliance mode, and can switch to USB mode to connect to a laptop or room PC. Aplus Technology Solutions supplies, installs and maintains Rally Bar deployments across India with GST invoicing and AMC support.`,
    features: [
      "Motorized PTZ camera with AI auto-framing and speaker tracking",
      "Runs Microsoft Teams Rooms & Zoom Rooms on-device (appliance mode)",
      "15x HD zoom (5x optical, 3x digital)",
      "Integrated beamforming mics and hi-fi speakers",
      "USB mode for laptop / room-PC connection",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Medium–Large Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "90° diagonal / 82.1° horizontal / 52.2° vertical",
        Zoom: "15x HD zoom (5x optical, 3x digital)",
        "Pan / Tilt": "Motorized ±25° pan, ±15° tilt",
      },
      Audio: {
        Microphones: "Beamforming mic array with echo cancellation",
        Speakers: "Integrated hi-fi speaker system",
      },
      "Compute & Platform": {
        Modes: "Appliance (Microsoft Teams Rooms / Zoom Rooms) + USB",
        OS: "Logitech CollabOS",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-bar/1.webp"],
  },
  {
    id: "logitech-rally-bar-mini",
    brand: "Logitech",
    name: "Logitech Rally Bar Mini",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "All-in-one video bar for small to medium rooms with an ultra-wide 113° field of view, six-mic array and built-in compute for Microsoft Teams Rooms and Zoom Rooms.",
    longDescription: `Logitech Rally Bar Mini is an all-in-one video bar for small to medium meeting rooms. An ultra-wide 4K camera keeps everyone in frame even when seated close, while six beamforming microphones and a three-driver speaker system deliver clear, room-filling audio.

Rally Bar Mini runs Microsoft Teams Rooms or Zoom Rooms on-device in appliance mode and switches to USB mode for laptop or room-PC use. Aplus Technology Solutions supplies, installs and maintains Rally Bar Mini deployments across India with GST invoicing and AMC support.`,
    features: [
      "Ultra-wide 4K camera with 113° horizontal field of view",
      "Six beamforming mics with up to 7 m / 23 ft pickup",
      "Runs Microsoft Teams Rooms & Zoom Rooms on-device",
      "Three-driver speaker system (woofer + two mid-range)",
      "USB mode for laptop / room-PC connection",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "113° FOV",
      screenSizes: [],
      operationTime: "Small–Medium Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "120° diagonal / 113° horizontal / 80.7° vertical",
        Zoom: "4x HD digital zoom",
      },
      Audio: {
        Microphones: "Six omnidirectional MEMS mics, five adaptive beams",
        "Pickup Range": "Up to 7 m / 23 ft",
        Speakers: "Three-driver system (70 mm woofer, two 1.5\" mid-range)",
      },
      "Compute & Platform": {
        Modes: "Appliance (Microsoft Teams Rooms / Zoom Rooms) + USB",
        OS: "Logitech CollabOS",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-bar-mini/1.webp"],
  },
  {
    id: "logitech-rally-bar-huddle",
    brand: "Logitech",
    name: "Logitech Rally Bar Huddle",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "Compact all-in-one video bar for huddle and small rooms with a 123°-class ultra-wide camera and built-in compute for Microsoft Teams Rooms and Zoom Rooms.",
    longDescription: `Logitech Rally Bar Huddle is a compact all-in-one video bar purpose-built for huddle and small rooms. A wide 4K camera frames tight spaces edge to edge, while a six-mic array and full-range speaker keep conversations natural.

Rally Bar Huddle runs Microsoft Teams Rooms or Zoom Rooms on-device via Logitech CollabOS and pairs neatly with a Tap IP controller for one-touch join. Aplus Technology Solutions supplies, installs and maintains Rally Bar Huddle deployments across India with GST invoicing and AMC support.`,
    features: [
      "Wide 4K camera tuned for huddle and small rooms",
      "Six-mic array with echo cancellation and voice detection",
      "Runs Microsoft Teams Rooms & Zoom Rooms on-device",
      "Full-range ported speaker",
      "Pairs with Tap IP for one-touch join",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "123° FOV",
      screenSizes: [],
      operationTime: "Huddle Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD",
        "Field of View": "120° diagonal / 113° horizontal / 80° vertical",
        Zoom: "4x HD digital zoom",
      },
      Audio: {
        Microphones: "Six omnidirectional MEMS mics, five adaptive beams",
        Speakers: "One full-range ported speaker",
        Processing: "Acoustic echo cancellation, voice activity detection",
      },
      "Compute & Platform": {
        Modes: "Appliance (Microsoft Teams Rooms / Zoom Rooms)",
        OS: "Logitech CollabOS",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-bar-huddle/1.webp"],
  },
  {
    id: "logitech-rally-plus",
    brand: "Logitech",
    name: "Logitech Rally Plus",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Video Bars & Systems",
    description:
      "Modular premium conferencing system for large rooms — Ultra-HD PTZ camera with two speakers and two mic pods, expandable for the biggest boardrooms.",
    longDescription: `Logitech Rally Plus is a modular, premium conferencing system engineered for large meeting rooms and boardrooms. It pairs an Ultra-HD PTZ camera with two Rally Speakers and two Rally Mic Pods, and scales up to seven mic pods for full coverage of the largest spaces.

Rally Plus delivers cinematic 4K video with 15x HD zoom and automatic speaker framing, connecting over USB to a room PC or Logitech room compute. Aplus Technology Solutions supplies, installs and maintains Rally Plus deployments across India with GST invoicing and AMC support.`,
    features: [
      "Ultra-HD PTZ camera with 15x HD zoom (5x optical, 3x digital)",
      "Includes two Rally Speakers and two Rally Mic Pods",
      "Modular audio expandable to seven mic pods",
      "Automatic speaker framing and RightSense technologies",
      "Works with Microsoft Teams Rooms, Zoom Rooms and Google Meet",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Large Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "90° diagonal / 82.1° horizontal / 52.2° vertical",
        Zoom: "15x HD zoom (5x optical, 3x digital)",
        "Pan / Tilt": "±90° pan, +50° / -90° tilt",
      },
      Audio: {
        Microphones: "Modular mic pods, four omnidirectional mics forming eight beams",
        "Pickup Range": "Up to 4.5 m / 15 ft per pod",
        Speakers: "Two Rally Speakers (included)",
        Expandability: "Up to seven mic pods",
      },
      Connectivity: {
        Interface: "USB 3.0",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-plus/1.webp"],
  },
  {
    id: "logitech-meetup-2",
    brand: "Logitech",
    name: "Logitech MeetUp 2",
    category: "Video Conferencing",
    series: "MeetUp",
    subCategory: "Video Bars & Systems",
    description:
      "Super-wide all-in-one conference camera for huddle and small rooms, with a 4K sensor, 113° field of view, RightSight auto-framing and integrated audio.",
    longDescription: `Logitech MeetUp 2 is a super-wide all-in-one conference camera designed for huddle and small rooms. Its 4K sensor and 113° horizontal field of view capture everyone at the table, even in tight spaces, while RightSight computer vision automatically frames the group or the active speaker.

MeetUp 2 integrates six beamforming microphones and room-tuned speakers with AI denoising for clear, natural audio. It connects over USB to a room PC or Logitech room compute. Aplus Technology Solutions supplies, installs and maintains MeetUp 2 deployments across India with GST invoicing and AMC support.`,
    features: [
      "4K sensor with 113° horizontal field of view for tight rooms",
      "RightSight auto-framing of the group or active speaker",
      "Six beamforming mics with up to 7 m / 23 ft pickup",
      "AI-based denoising for clear audio",
      "Integrated room-tuned speaker",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "113° FOV",
      screenSizes: [],
      operationTime: "Huddle–Small Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD",
        "Field of View": "120° diagonal / 113° horizontal / 80° vertical",
        Zoom: "4x HD digital zoom",
        Framing: "RightSight auto-framing",
      },
      Audio: {
        Microphones: "Six omnidirectional MEMS mics, five adaptive beams",
        "Pickup Range": "Up to 7 m / 23 ft",
        Processing: "Echo cancellation, voice detection, AI denoising",
      },
      Connectivity: {
        Interface: "USB",
      },
    },
    images: ["/products/video-conferencing/logitech-meetup-2/1.webp"],
  },
  // ── Cameras ────────────────────────────────────────────────────────────
  {
    id: "logitech-rally-ai-camera",
    brand: "Logitech",
    name: "Logitech Rally AI Camera",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Cameras",
    description:
      "AI PTZ conference camera with a 20 MP 1-inch sensor and 115°-class field of view, delivering intelligent framing and brilliant optics for medium to large rooms.",
    longDescription: `Logitech Rally AI Camera is an AI-driven PTZ conference camera built around a 20 MP one-inch sensor for brilliant low-light optics. Its wide 115.7° diagonal field of view and on-camera AI deliver intelligent framing that finds, frames and follows participants automatically.

Rally AI Camera connects to Logitech room compute or a room PC and is a natural front-of-room camera for medium to large spaces. Aplus Technology Solutions supplies, installs and maintains Rally AI Camera deployments across India with GST invoicing and AMC support.`,
    features: [
      "20 MP one-inch sensor for brilliant low-light optics",
      "Wide 115.7° diagonal field of view",
      "On-camera AI intelligent framing and speaker tracking",
      "4x HD digital zoom",
      "Works with Microsoft Teams Rooms, Zoom Rooms and Google Meet",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "116° FOV",
      screenSizes: [],
      operationTime: "Medium–Large Rooms",
    },
    specGroups: {
      Camera: {
        Sensor: "20 MP, one-inch",
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "115.7° diagonal / 103.3° horizontal / 60.7° vertical",
        Zoom: "4x HD digital zoom",
        Framing: "AI intelligent framing and speaker tracking",
      },
      Audio: {
        Microphones: "Eight omnidirectional digital mic elements",
      },
      Connectivity: {
        Interface: "USB",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-ai-camera/1.webp"],
  },
  {
    id: "logitech-rally-ai-camera-pro",
    brand: "Logitech",
    name: "Logitech Rally AI Camera Pro",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Cameras",
    description:
      "Flagship AI PTZ camera combining a 15x hybrid-zoom optical camera with a one-inch digital camera, for large and complex boardrooms and training rooms.",
    longDescription: `Logitech Rally AI Camera Pro is the flagship of the Rally camera line, engineered for large and complex spaces such as boardrooms and training rooms. It uniquely combines an optical camera with 15x hybrid zoom and a second one-inch digital camera driven by an 8 MP sensor, so remote participants get close, detailed shots without losing the wide room view.

Motorized PTZ with a ±90° pan range and on-camera AI keep every speaker perfectly framed. Aplus Technology Solutions supplies, installs and maintains Rally AI Camera Pro deployments across India with GST invoicing and AMC support.`,
    features: [
      "Dual optical + digital camera design with a one-inch sensor",
      "15x hybrid zoom (5x optical, 3x digital)",
      "Motorized PTZ: ±90° pan, +50° / -90° tilt",
      "On-camera AI framing for large, complex rooms",
      "Wide 262° horizontal total room coverage",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Large Rooms",
    },
    specGroups: {
      Camera: {
        Sensor: "8 MP optical camera + one-inch digital camera",
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "90° diagonal / 82° horizontal / 52° vertical",
        Zoom: "15x hybrid zoom (5x optical, 3x digital)",
        "Pan / Tilt": "±90° pan, +50° / -90° tilt",
        "Total Room Coverage": "262° horizontal / 192° vertical",
      },
      "AI & Framing": {
        Framing: "AI intelligent framing and multi-speaker tracking",
      },
      Connectivity: {
        Interface: "USB",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-ai-camera-pro/1.webp"],
  },
  {
    id: "logitech-rally-camera",
    brand: "Logitech",
    name: "Logitech Rally Camera",
    category: "Video Conferencing",
    series: "Rally",
    subCategory: "Cameras",
    description:
      "Premium Ultra-HD PTZ conference camera with 15x HD zoom and whisper-quiet mechanical pan and tilt, delivering brilliant 4K optics for meeting rooms of every size.",
    longDescription: `Logitech Rally Camera is a premium Ultra-HD PTZ conference camera that captures brilliant 4K video with 15x HD zoom. A whisper-quiet mechanical PTZ motor adjusts pan and tilt speed with zoom level, so movements stay smooth and unobtrusive on camera.

Rally Camera connects over USB to a room PC or Logitech room compute and suits meeting rooms of every size, from small to large. Aplus Technology Solutions supplies, installs and maintains Rally Camera deployments across India with GST invoicing and AMC support.`,
    features: [
      "4K sensor capturing up to 4K at 30 fps",
      "15x HD zoom (5x optical, 3x digital)",
      "Whisper-quiet mechanical pan and tilt",
      "Auto-focus with three camera presets",
      "USB 3.0 plug-and-play connectivity",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Small–Large Rooms",
    },
    specGroups: {
      Camera: {
        "Sensor Resolution": "4K UHD (up to 30 fps)",
        "Field of View": "90° diagonal / 82.1° horizontal / 52.2° vertical",
        Zoom: "15x HD zoom (5x optical, 3x digital)",
        "Pan / Tilt": "±90° pan, +50° / -90° tilt",
        "Focal Length": "Wide 3.725 mm, Tele 17.88 mm",
      },
      Connectivity: {
        Interface: "USB 3.0 (UVC 1.5)",
        "Cable Length": "2.2 m",
      },
      Power: {
        "Power Supply": "AC/DC adapter, 100–240 V, 50/60 Hz",
      },
    },
    images: ["/products/video-conferencing/logitech-rally-camera/1.webp"],
  },
  {
    id: "logitech-ptz-pro-2",
    brand: "Logitech",
    name: "Logitech PTZ Pro 2",
    category: "Video Conferencing",
    series: "PTZ Pro",
    subCategory: "Cameras",
    description:
      "Full-HD 1080p PTZ conference camera with 10x lossless zoom and wide mechanical pan and tilt, built for classrooms, auditoriums and large meeting rooms.",
    longDescription: `Logitech PTZ Pro 2 is a professional-grade USB PTZ conference camera delivering crisp Full-HD 1080p video at 30 fps. A 10x lossless HD zoom and wide mechanical pan and tilt range let it cover large spaces from a single mounting point.

PTZ Pro 2 is a proven fit for classrooms, auditoriums and large meeting rooms, with preset positions and plug-and-play USB connectivity. Aplus Technology Solutions supplies, installs and maintains PTZ Pro 2 deployments across India with GST invoicing and AMC support.`,
    features: [
      "Full-HD 1080p video at 30 fps",
      "10x lossless full-HD zoom with autofocus",
      "Wide mechanical pan (260°) and tilt (130°)",
      "Camera presets for quick framing recall",
      "Plug-and-play USB connectivity",
    ],
    specs: {
      resolution: "1080p HD",
      brightness: "90° FOV",
      screenSizes: [],
      operationTime: "Medium Rooms",
    },
    specGroups: {
      Camera: {
        Resolution: "1920 × 1080 (Full HD) at 30 fps",
        "Field of View": "90° diagonal",
        Zoom: "10x lossless HD zoom with autofocus",
        "Pan / Tilt": "260° pan, 130° tilt",
      },
      Connectivity: {
        Interface: "USB plug-and-play",
      },
    },
    images: ["/products/video-conferencing/logitech-ptz-pro-2/1.webp"],
  },
  {
    id: "logitech-sight",
    brand: "Logitech",
    name: "Logitech Sight",
    category: "Video Conferencing",
    series: "Sight",
    subCategory: "Cameras",
    description:
      "Tabletop AI companion camera with a 315° field of view and seven beamforming mics, capturing conversation and expressions from the centre of the table.",
    longDescription: `Logitech Sight is a tabletop AI companion camera that gives remote participants a face-to-face seat at the table. Positioned at the centre of the room, its dual 4K cameras and 315° field of view detect and frame speakers all around the table, switching between up to four active speakers as the conversation shifts.

Sight pairs with a front-of-room camera such as Rally Bar to deliver an immersive hybrid meeting experience, and its seven beamforming mics capture clear audio up to 2.3 m / 7.5 ft away. Aplus Technology Solutions supplies, installs and maintains Sight deployments across India with GST invoicing and AMC support.`,
    features: [
      "Tabletop companion camera with a 315° field of view",
      "Dual 4K cameras that frame speakers around the table",
      "Seven beamforming mics, up to 2.3 m / 7.5 ft pickup",
      "Tracks and switches between up to four active speakers",
      "Pairs with a front-of-room camera such as Rally Bar",
    ],
    specs: {
      resolution: "4K",
      brightness: "Center-of-room capture",
      screenSizes: [],
      operationTime: "Companion Camera",
    },
    specGroups: {
      Camera: {
        "Camera Resolution": "4K (dual cameras)",
        "Field of View": "315°",
        Placement: "Tabletop, center-of-room",
      },
      Audio: {
        Microphones: "Seven omnidirectional MEMS mics, six endfire beams",
        "Pickup Range": "2.3 m / 7.5 ft radius per device",
      },
      "AI & Framing": {
        "Speaker Tracking": "Frames and follows up to four speakers",
      },
    },
    images: ["/products/video-conferencing/logitech-sight/1.webp"],
  },
  {
    id: "logitech-scribe",
    brand: "Logitech",
    name: "Logitech Scribe",
    category: "Video Conferencing",
    series: "Scribe",
    subCategory: "Cameras",
    description:
      "AI whiteboard camera that broadcasts a clear, enhanced whiteboard stream into meetings, with a transparency effect that lets remote viewers see through the presenter.",
    longDescription: `Logitech Scribe is an AI whiteboard camera that shares any dry-erase whiteboard into a video meeting with outstanding clarity. Built-in AI enhances marker colour and contrast, and a transparency effect lets remote participants see "through" a presenter standing in front of the board for an unobstructed view.

Scribe mounts above the whiteboard, is powered over a single Cat5e cable using PoE, and works with Microsoft Teams Rooms, Zoom Rooms and Google Meet, or any application as a USB camera. Aplus Technology Solutions supplies, installs and maintains Scribe deployments across India with GST invoicing and AMC support.`,
    features: [
      "Broadcasts a clear, AI-enhanced whiteboard stream",
      "Transparency effect to see through the presenter",
      "Auto-enhances dry-erase marker colour and contrast",
      "Captures a whiteboard up to 1.8 m × 1.2 m (6 ft × 4 ft)",
      "Single Cat5e cable with Power over Ethernet",
    ],
    specs: {
      resolution: "Whiteboard Capture",
      brightness: "AI content enhancement",
      screenSizes: [],
      operationTime: "Any Room",
    },
    specGroups: {
      Camera: {
        "Output Resolution": "1080p at 15 fps",
        "Capture Area": "Up to 1.8 m × 1.2 m (6 ft × 4 ft)",
        AI: "Transparency effect, marker colour and contrast enhancement",
      },
      Connectivity: {
        Interface: "USB via mounted box",
        Power: "Cat5e with Power over Ethernet (PoE)",
      },
      Compatibility: {
        Platforms: "Microsoft Teams Rooms, Zoom Rooms, Google Meet",
      },
    },
    images: ["/products/video-conferencing/logitech-scribe/1.webp"],
  },
  // ── Controllers & Scheduling ──────────────────────────────────────────
  {
    id: "logitech-tap",
    brand: "Logitech",
    name: "Logitech Tap",
    category: "Video Conferencing",
    series: "Tap",
    subCategory: "Controllers & Scheduling",
    description:
      "In-room touch controller with a 10.1-inch display and HDMI content share, delivering one-touch join for Microsoft Teams Rooms and Zoom Rooms.",
    longDescription: `Logitech Tap is an in-room touch controller that puts one-touch meeting join, calendar and content sharing at everyone's fingertips. A responsive 10.1-inch touchscreen with an anti-glare, anti-fingerprint coating keeps controls clear, while an HDMI input enables in-room laptop content sharing at up to 1080p.

Tap connects over USB to a room PC or Logitech room compute and is a standard companion for Rally and MeetUp systems. Aplus Technology Solutions supplies, installs and maintains Tap deployments across India with GST invoicing and AMC support.`,
    features: [
      "10.1-inch touchscreen for one-touch meeting join",
      "HDMI input for in-room laptop content sharing (up to 1080p)",
      "Anti-glare, anti-fingerprint coating",
      "Integrated motion sensor wakes the room",
      "USB-C connection to the room host system",
    ],
    specs: {
      resolution: "1280 × 800",
      brightness: "USB touch controller",
      screenSizes: ["10.1"],
      operationTime: "Any Room",
    },
    specGroups: {
      Display: {
        "Diagonal Size": '10.1"',
        Resolution: "1280 × 800",
        Touch: "Capacitive multi-touch",
        Coatings: "Anti-glare, anti-fingerprint",
      },
      Connectivity: {
        Host: "USB-C to room host system",
        "Content Input": "HDMI in, up to 1920 × 1080 at 60 Hz",
        Audio: "3.5 mm 4-pole headset jack",
      },
      Mounting: {
        VESA: "100 × 100 mm",
      },
    },
    images: ["/products/video-conferencing/logitech-tap/1.webp"],
  },
  {
    id: "logitech-tap-ip",
    brand: "Logitech",
    name: "Logitech Tap IP",
    category: "Video Conferencing",
    series: "Tap",
    subCategory: "Controllers & Scheduling",
    description:
      "Network touch controller with a 10.1-inch display and a single Power-over-Ethernet connection, for one-touch join with appliance-mode room systems.",
    longDescription: `Logitech Tap IP is a network-connected in-room touch controller that simplifies installation to a single Power-over-Ethernet cable. Its 10.1-inch touchscreen delivers the same one-touch meeting join as Tap, and it pairs natively with appliance-mode systems such as Rally Bar and RoomMate over the network.

Tap IP is ideal where a clean, cable-light room layout matters. Aplus Technology Solutions supplies, installs and maintains Tap IP deployments across India with GST invoicing and AMC support.`,
    features: [
      "10.1-inch touchscreen for one-touch meeting join",
      "Single Power-over-Ethernet (PoE) connection",
      "Pairs with appliance-mode systems over the network",
      "Anti-glare, anti-fingerprint coating",
      "Simple, cable-light installation",
    ],
    specs: {
      resolution: "1280 × 800",
      brightness: "PoE touch controller",
      screenSizes: ["10.1"],
      operationTime: "Any Room",
    },
    specGroups: {
      Display: {
        "Diagonal Size": '10.1"',
        Resolution: "1280 × 800",
        Touch: "Capacitive multi-touch",
        "Display Angle": "14°",
      },
      Connectivity: {
        Network: "Power over Ethernet (PoE), IEEE 802.3af Type 1, Class 3",
        Pairing: "Appliance-mode room systems over LAN",
      },
    },
    images: ["/products/video-conferencing/logitech-tap-ip/1.webp"],
  },
  {
    id: "logitech-tap-scheduler",
    brand: "Logitech",
    name: "Logitech Tap Scheduler",
    category: "Video Conferencing",
    series: "Tap",
    subCategory: "Controllers & Scheduling",
    description:
      "Purpose-built room-scheduling panel with a 10.1-inch display and room-status LEDs, mounted outside the room to show availability and book on the spot.",
    longDescription: `Logitech Tap Scheduler is a purpose-built scheduling panel mounted outside the meeting room to display availability at a glance and let people book the room on the spot. A 10.1-inch IPS touchscreen and wide-angle room-status LEDs make availability visible down the hallway.

Tap Scheduler installs with a single PoE cable and works with leading room-booking services. Aplus Technology Solutions supplies, installs and maintains Tap Scheduler deployments across India with GST invoicing and AMC support.`,
    features: [
      "10.1-inch IPS touchscreen for outside-room scheduling",
      "Wide-angle room-status LEDs visible down the hallway",
      "Book or release the room on the spot",
      "Single Power-over-Ethernet (PoE) installation",
      "Works with leading room-booking services",
    ],
    specs: {
      resolution: "1280 × 800",
      brightness: "Room-status LEDs",
      screenSizes: ["10.1"],
      operationTime: "Outside-room Scheduling",
    },
    specGroups: {
      Display: {
        "Diagonal Size": '10.1"',
        "Panel Type": "IPS LCD with LED backlighting",
        Resolution: "1280 × 800",
        "Brightness (Typical)": "400 nit",
        "Viewing Angle": "85° (up/down/left/right)",
        Touch: "Capacitive 10-point multi-touch",
      },
      Connectivity: {
        Network: "Power over Ethernet (PoE), IEEE 802.3af Type 1, Class 3",
      },
      Indicators: {
        "Status LEDs": "Wide-angle room availability LEDs",
      },
    },
    images: ["/products/video-conferencing/logitech-tap-scheduler/1.webp"],
  },
  // ── Room Compute ──────────────────────────────────────────────────────
  {
    id: "logitech-roommate",
    brand: "Logitech",
    name: "Logitech RoomMate",
    category: "Video Conferencing",
    series: "RoomMate",
    subCategory: "Room Compute",
    description:
      "Dedicated compute appliance running Logitech CollabOS, deploying Microsoft Teams Rooms on Android and Zoom Rooms Appliances with Logitech USB cameras — no room PC.",
    longDescription: `Logitech RoomMate is a purpose-built compute appliance that runs Microsoft Teams Rooms on Android, Zoom Rooms Appliances and other leading services without a dedicated room PC. Paired with a Logitech USB camera such as Rally System or MeetUp and a Tap or Tap IP controller, it turns any space into a consistent, easy-to-manage meeting room.

RoomMate runs Logitech CollabOS, drives one or two displays, and is monitored and managed remotely through Logitech Sync. Aplus Technology Solutions supplies, installs and maintains RoomMate deployments across India with GST invoicing and AMC support.`,
    features: [
      "Runs Microsoft Teams Rooms on Android and Zoom Rooms Appliances",
      "Powered by Logitech CollabOS — no dedicated room PC",
      "Drives one or two displays (third via dongle)",
      "Pairs with Logitech USB cameras and Tap controllers",
      "Remote monitoring and management via Logitech Sync",
    ],
    specs: {
      resolution: "4K UHD",
      brightness: "CollabOS",
      screenSizes: [],
      operationTime: "Any Room",
    },
    specGroups: {
      "Compute & Platform": {
        OS: "Logitech CollabOS",
        Platforms: "Microsoft Teams Rooms (Android), Zoom Rooms Appliances, GoTo, Pexip, RingCentral",
        "Video Output": "One or two displays (third via dongle)",
        "Max Video": "4K UHD",
      },
      "Peripherals & Audio": {
        Cameras: "Logitech USB cameras — Rally System, Rally Plus, MeetUp, Rally Camera",
        Controllers: "Tap, Tap IP",
        "Verified Audio": "Biamp, QSC, Shure",
      },
      Management: {
        Tools: "Logitech Sync, Teams admin center, Zoom Device Management",
      },
    },
    images: ["/products/video-conferencing/logitech-roommate/1.webp"],
  },
];
