/**
 * Logitech room-size and platform buying guides.
 * One page each at /categories/video-conferencing/{slug}.
 *
 * POSITIONING: Aplus resells genuine Logitech product (nominative fair use) but
 * is NOT an authorized Logitech partner. Nothing in this file may contain
 * "authorized", "partner", "certified", or "Samsung" — including the true
 * Logitech claim "Certified for Microsoft Teams", which must be written as
 * "runs Microsoft Teams Rooms out of the box". Enforced by vcRoomGuides.test.ts.
 *
 * Each guide is hand-written, not template-derived: room-size and platform are
 * the two axes where the recommendation genuinely changes, which is what keeps
 * these pages out of doorway-page territory. See the design spec.
 */

export interface VcRoomGuideSection {
  heading: string;
  /** 60-110 words of indexable body copy. */
  body: string;
}

export interface VcRoomGuide {
  slug: string;
  kind: "room" | "platform";
  /** Short label for breadcrumbs and cross-link cards, e.g. "Huddle Rooms". */
  navLabel: string;
  /** SEO H1, ~50-65 chars. */
  title: string;
  subtitle: string;
  /** ~50-word intro; also the meta description. */
  intro: string;
  /**
   * For kind "room": the exact `specs.operationTime` values this guide covers.
   * Copy them verbatim from data/videoConferencing.ts — the compound bands use
   * an EN DASH (U+2013), and a hyphen will fail the test. Omit for platforms.
   */
  roomBands?: string[];
  /** Curated product ids, in display order. */
  productIds: string[];
  sections: VcRoomGuideSection[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
}

export const vcRoomGuides: VcRoomGuide[] = [
  {
    slug: "huddle-rooms",
    kind: "room",
    navLabel: "Huddle Rooms",
    title: "Logitech Huddle Room Video Conferencing Systems",
    subtitle:
      "All-in-one video bars sized for two-to-six-person rooms, with one-touch join and no room PC.",
    intro:
      "Huddle rooms need a single device that covers camera, microphones and speakers without a rack or a room PC. Logitech's compact bars mount under a display, run Microsoft Teams Rooms or Zoom Rooms on-device, and cover a short table end to end. Aplus supplies, installs and maintains them across India.",
    roomBands: ["Huddle Rooms", "Huddle–Small Rooms"],
    productIds: [
      "logitech-rally-bar-huddle",
      "logitech-meetup-2",
      "logitech-tap-ip",
      "logitech-tap-scheduler",
    ],
    sections: [
      {
        heading: "What counts as a huddle room",
        body:
          "A huddle room seats two to six people at a table roughly 1.5 to 2.5 metres long, usually with a single display on the short wall. The camera has to cover a wide angle at close range rather than reach down a long table, so field of view matters more than optical zoom. One integrated device is almost always the right answer: separate cameras, mics and DSP add cost and cabling that a room this size never recovers.",
      },
      {
        heading: "Why an all-in-one bar fits this size",
        body:
          "Rally Bar Huddle and MeetUp 2 put a wide-angle camera, a beamforming mic array and speakers in one chassis that mounts under the display. Both run Microsoft Teams Rooms and Zoom Rooms on-device, so there is no separate room PC to specify, patch or fail. AI framing keeps whoever is talking in shot without an operator. For a room used ad hoc all day, fewer components means fewer support calls.",
      },
      {
        heading: "Adding a controller and scheduling",
        body:
          "A bar alone joins meetings from its remote, which is fine for a room with a known owner. For shared huddle spaces, Tap IP gives a wall- or table-mounted touch controller over a single network cable, and Tap Scheduler mounted outside the door shows availability and lets someone claim the room on the spot. Both reduce the most common huddle-room complaint, which is people standing in the doorway wondering whether the room is free.",
      },
    ],
    faqs: [
      {
        q: "How many people does a Logitech huddle room bar cover?",
        a: "Rally Bar Huddle and MeetUp 2 are built for two-to-six-person rooms with a short table. Above that, the camera is still fine but the microphone pickup starts to favour the near end — that is the point to move up to a medium-room bar. Tell us your table length and we will confirm.",
      },
      {
        q: "Do I need a room PC for a huddle room?",
        a: "No. Both recommended bars run Microsoft Teams Rooms and Zoom Rooms on the device itself, so a huddle room needs the bar, a display and network. A separate compute appliance only becomes useful when you want to drive a second screen or run a platform the bar does not host on-device.",
      },
      {
        q: "Can one bar switch between Teams and Zoom?",
        a: "Yes. These bars host both platforms and you select which one the room runs; some deployments also allow switching modes. If your organisation runs both, tell us which should be the default and we will configure the room that way before delivery.",
      },
      {
        q: "What does Aplus supply with a huddle room order?",
        a: "Aplus supplies genuine Logitech hardware with GST invoicing, mounts and cabling, on-site installation and configuration for your platform, and AMC support across India. A free installation assessment is available for every order.",
      },
    ],
    ctaHeading: "Fitting out huddle rooms?",
  },
  {
    slug: "medium-meeting-rooms",
    kind: "room",
    navLabel: "Medium Meeting Rooms",
    title: "Logitech Video Conferencing for Medium Meeting Rooms",
    subtitle:
      "Bars, PTZ cameras and room compute for six-to-twelve-person rooms, sized by table length rather than by seat count.",
    intro:
      "A six-to-twelve-person room is where the choice actually opens up: an all-in-one bar, or a separate PTZ camera driven by room compute. Logitech covers both shapes with Rally Bar Mini, Rally Bar, Rally AI Camera, Rally Camera and RoomMate. Aplus sizes the room, supplies the hardware and installs it across India.",
    roomBands: [
      "Small–Medium Rooms",
      "Medium–Large Rooms",
      "Medium Rooms",
      "Small–Large Rooms",
    ],
    productIds: [
      "logitech-rally-bar-mini",
      "logitech-rally-bar",
      "logitech-rally-ai-camera",
      "logitech-ptz-pro-2",
      "logitech-rally-camera",
      "logitech-tap",
      "logitech-roommate",
    ],
    sections: [
      {
        heading: "Sizing a six-to-twelve-person room",
        body:
          "Size by table length and the distance from the display to the far seat, not by chair count. Rally Bar Mini is comfortable to roughly 4.5 metres, with six beamforming mics rated to 7 metres of pickup and a 113° horizontal view that keeps close-in seats in frame. Past about 5 metres the far end starts to look small and sound distant, and the room needs Rally Bar's motorised PTZ camera with 15x zoom, or a front-of-room camera plus table mics.",
      },
      {
        heading: "When to move from a bar to a camera plus compute",
        body:
          "An all-in-one bar is the cheaper, faster install and the right default. Split the room into a separate camera and compute appliance when the display wall cannot take a bar, when a lectern or an odd seating layout means the camera has to mount away from the audio, when you want a 20 MP one-inch sensor for low ambient light, or when the room must drive two displays. Rally AI Camera, Rally Camera or PTZ Pro 2 with RoomMate covers each of those cases.",
      },
      {
        heading: "The controller in a shared room",
        body:
          "Any room booked by more than one team needs a touch controller, not a remote that walks off. Tap mounts on the table or a wall bracket, wakes the room on motion, and adds an HDMI input so a visitor can share a laptop at 1080p without pairing anything. It connects over USB-C to the bar or to RoomMate. In practice the controller is what makes staff trust the room, because joining stops being a negotiation with the display source.",
      },
      {
        heading: "Cabling and display count",
        body:
          "Plan the cable runs before you pick the hardware. A bar wants power and HDMI within reach of the display, plus a network drop; a Tap needs its USB-C run back to the host, and a floor box or table grommet if it lives on the table. RoomMate drives one or two displays natively, which is the usual reason a dual-screen room needs it. Keep camera and controller runs inside their supported cable lengths, and budget for conduit or trunking if the table is in the middle of the floor.",
      },
    ],
    faqs: [
      {
        q: "Which Logitech bar suits a ten-person meeting room?",
        a: "Rally Bar, in most cases. Its motorised PTZ camera and 15x HD zoom reach the far end of a longer table, and the integrated speakers fill the room. Rally Bar Mini can cover ten seats if the table is short and the seating is tight, so send us the table dimensions and we will tell you which one to buy.",
      },
      {
        q: "Should I choose an all-in-one bar or a separate camera?",
        a: "Choose the bar unless something in the room argues against it — no mounting position under the display, a camera that must sit away from the audio, very low light, or a dual-display requirement. In those cases a Rally AI Camera or Rally Camera with RoomMate gives you placement freedom, at the cost of more devices and more cabling to commission.",
      },
      {
        q: "Do I need RoomMate in a medium room?",
        a: "Only if the room's camera cannot host the meeting platform itself. Rally Bar and Rally Bar Mini already run Microsoft Teams Rooms and Zoom Rooms on-device. RoomMate earns its place when the room uses a USB-only camera such as Rally Camera or PTZ Pro 2, when you need two displays, or when you want every room managed identically through Logitech Sync.",
      },
      {
        q: "What is included when Aplus fits out a medium meeting room?",
        a: "You get genuine Logitech hardware on a GST invoice, display and camera mounts, cable runs terminated and dressed, and the room configured for your meeting platform and calendar before handover. AMC cover is available city-wide across India, and we will survey the room free of charge before you commit to a design.",
      },
    ],
    ctaHeading: "Standardising your medium meeting rooms?",
  },
  {
    slug: "boardrooms",
    kind: "room",
    navLabel: "Boardrooms",
    title: "Logitech Boardroom Video Conferencing Systems",
    subtitle:
      "Modular cameras, distributed mic pods and whiteboard capture for large rooms where the far end has to hear everyone.",
    intro:
      "In a boardroom, audio fails before video does. A single bar cannot pick up a sixteen-seat table, so large rooms move to modular mic pods, a long-reach PTZ camera and front-of-room touch control. Logitech's Rally Plus, Rally Board 65, Rally AI Camera Pro, Sight and Scribe cover the range, installed by Aplus.",
    roomBands: ["Large Rooms"],
    productIds: [
      "logitech-rally-plus",
      "logitech-rally-board-65",
      "logitech-rally-ai-camera-pro",
      "logitech-sight",
      "logitech-scribe",
      "logitech-tap",
    ],
    sections: [
      {
        heading: "Why large rooms need distributed mic pods",
        body:
          "Microphone pickup is the hard constraint in a boardroom. A Rally Mic Pod covers roughly 4.5 metres, so a long table needs pods placed down its length rather than one array at the front wall. Distributing them keeps every voice at a similar level, which is what stops the far end asking people to repeat themselves. Rally Plus ships with two pods and scales to seven, so a table can be covered properly instead of asking the back half of the room to lean forward.",
      },
      {
        heading: "Modular Rally Plus or all-in-one Rally Board 65",
        body:
          "Rally Plus is the choice when the room already has a large display or projector and you need audio coverage tuned to the table: an Ultra-HD PTZ camera with 15x zoom, two Rally Speakers, and mic pods added to suit. Rally Board 65 goes the other way — a 65-inch 4K touchscreen with camera, mics and speakers in one wall- or cart-mounted unit that runs the meeting platform on-device. Rally Board suits a room without an existing screen, or one that also wants touch whiteboarding.",
      },
      {
        heading: "Adding table view and whiteboard capture",
        body:
          "A front-of-room camera shows a row of profiles when people at the table turn to each other. Sight sits at the centre of the table, uses dual 4K cameras across a 315° field of view, and switches between up to four active speakers so remote attendees see faces rather than ears. Scribe mounts above a dry-erase board and streams it into the meeting with marker contrast enhanced and a transparency effect that lets viewers see through the presenter. Both are additions to a room camera, not replacements.",
      },
      {
        heading: "Front-of-room control and executive expectations",
        body:
          "A board meeting is the wrong place to debug an input source. Tap gives the room a single 10.1-inch touch panel for one-touch join, camera presets and HDMI content share, so a director or an executive assistant starts the meeting without calling IT. Commission camera presets for the chair's seat and the presentation position, label the content input, and make sure the room wakes on motion. Executive rooms are judged on the first thirty seconds, and that is almost entirely a commissioning job.",
      },
    ],
    faqs: [
      {
        q: "How many mic pods does a sixteen-seat boardroom table need?",
        a: "Plan on one pod per 4.5 metres of table, which usually means three to four pods for a sixteen-seat table depending on its length and shape. Rally Plus includes two and expands to seven, so the coverage is a configuration decision rather than a different system. We measure the table and confirm the pod count in the site survey.",
      },
      {
        q: "Rally Plus or Rally Board 65 for a boardroom?",
        a: "Take Rally Plus when the room has a display you intend to keep and a table long enough to need multiple mic pods. Take Rally Board 65 when you want one wall-mounted device that supplies the screen, the camera, the audio and on-device whiteboarding, and the table is short enough for its integrated mic array to cover.",
      },
      {
        q: "What does Logitech Sight add to a boardroom?",
        a: "A centre-of-table view. The front-of-room camera cannot see faces when people turn towards each other across the table, and Sight's 315° coverage with speaker switching fills exactly that gap. It works alongside a room camera such as Rally Bar rather than instead of one, and it also contributes seven beamforming mics with a 2.3 metre pickup radius.",
      },
      {
        q: "How does Aplus handle a boardroom installation?",
        a: "We survey the room, mark pod and camera positions against the table layout, and quote genuine Logitech hardware with GST invoicing. Installation covers mounting, cable containment, platform and calendar configuration, camera presets and a hand-over walkthrough for the people who will actually run board meetings. AMC support is available across India.",
      },
    ],
    ctaHeading: "Upgrading the boardroom?",
  },
  {
    slug: "microsoft-teams-rooms",
    kind: "platform",
    navLabel: "Microsoft Teams Rooms",
    title: "Logitech Hardware for Microsoft Teams Rooms",
    subtitle:
      "Two deployment shapes, one management surface — pick the bar that hosts Teams Rooms itself, or let RoomMate drive the room.",
    intro:
      "Logitech gives a Microsoft Teams Rooms estate two build patterns: a video bar that runs Teams Rooms on Android itself, or RoomMate driving a USB camera. Both join with one touch from a Tap IP panel and report into Sync and the Teams admin centre. Aplus supplies and commissions either shape across India.",
    productIds: [
      "logitech-rally-bar-huddle",
      "logitech-rally-bar-mini",
      "logitech-rally-bar",
      "logitech-rally-board-65",
      "logitech-tap-ip",
      "logitech-roommate",
      "logitech-tap-scheduler",
    ],
    sections: [
      {
        heading: "Two ways to build a Teams room",
        body:
          "Shape one: a Rally Bar, Rally Bar Mini, Rally Bar Huddle or Rally Board 65 runs Teams Rooms on Android on the device itself. Nothing else sits in the room, and the bar is the resource account's endpoint. Shape two: RoomMate hosts Teams Rooms on Android and drives a USB camera you already own or need for optical reach. Shape one wins on device count and install time; shape two wins where the camera position, the room's second display or an existing camera decides the design.",
      },
      {
        heading: "The room ladder from huddle to boardroom",
        body:
          "Standardise on a ladder so procurement stops re-deciding per room. Two-to-six-person rooms take Rally Bar Huddle. Small and medium rooms take Rally Bar Mini, whose 113° view suits people seated close to the display. Six-to-twelve-person rooms take Rally Bar for its motorised PTZ and 15x zoom. Rooms that also need a screen and on-device whiteboarding take Rally Board 65 with its 65-inch 4K touch panel. Each rung runs the same Teams Rooms experience, so training and support scripts carry across the estate.",
      },
      {
        heading: "Tap IP and single-cable installation",
        body:
          "Tap IP is the natural controller for a Teams room built on appliance-mode hardware. It pairs with the bar or with RoomMate over the LAN and takes its power from the same Power-over-Ethernet run, so the table needs one Cat cable instead of a USB run plus a power brick. For an estate refresh, that halves the containment work and makes moves cheaper: relocating the table means re-terminating one drop, not re-pulling a proprietary cable.",
      },
      {
        heading: "Booking panels outside the door",
        body:
          "Teams rooms live and die by whether people can find a free one. Tap Scheduler mounts on the wall outside, shows the Exchange calendar for that resource, and lets someone book or release the room without opening Outlook. Wide-angle status LEDs read green or red from down the corridor, which is the whole point — the panel is for the person walking past, not the person already inside. It installs on a single PoE drop like Tap IP.",
      },
    ],
    faqs: [
      {
        q: "Should the bar host Teams Rooms or should I add a compute appliance?",
        a: "Let the bar host it whenever the room's camera can be a Logitech bar. Fewer devices means fewer firmware surfaces and a faster install. Add RoomMate when the room needs two displays, when the camera has to mount away from the audio, or when you are keeping a USB camera such as Rally Camera and want the same Teams Rooms build on top of it.",
      },
      {
        q: "Do I need a Windows PC in each Teams room?",
        a: "No. Both Logitech build shapes run Teams Rooms on Android, so no Windows machine, no domain join and no OS patching cycle in the room. You still need a resource account and a Teams Rooms licence per room, and the device enrols into the Teams admin centre for updates and health reporting alongside Logitech Sync.",
      },
      {
        q: "Which Logitech bar goes in which size of Teams room?",
        a: "Rally Bar Huddle for two-to-six-person rooms, Rally Bar Mini for small and medium rooms up to roughly 4.5 metres of table, and Rally Bar for six-to-twelve-person rooms that need PTZ reach. Choose Rally Board 65 where the room also needs the display and touch whiteboarding in the same unit.",
      },
      {
        q: "Can Aplus convert an existing meeting room to Teams Rooms?",
        a: "Usually yes, and often without replacing the display. We audit what the room already has, keep any USB camera worth keeping by pairing it with RoomMate, and quote the rest as genuine Logitech hardware with GST invoicing. Aplus handles mounting, cabling, resource-account configuration with your IT team, and AMC cover once the room is live.",
      },
    ],
    ctaHeading: "Rolling out Microsoft Teams Rooms?",
  },
  {
    slug: "zoom-rooms",
    kind: "platform",
    navLabel: "Zoom Rooms",
    title: "Logitech Hardware for Zoom Rooms",
    subtitle:
      "Appliance-mode Zoom Rooms on Logitech CollabOS — a shorter bill of materials, and the cases where room compute still belongs.",
    intro:
      "Zoom Rooms on Logitech hardware runs in appliance mode: CollabOS on the bar is the Zoom Rooms endpoint, so the room PC leaves the bill of materials entirely. Rally Bar Huddle through Rally Plus covers every size, with Tap for in-room control. Aplus supplies, installs and maintains Zoom Rooms across India.",
    productIds: [
      "logitech-rally-bar-huddle",
      "logitech-rally-bar-mini",
      "logitech-rally-bar",
      "logitech-rally-plus",
      "logitech-rally-board-65",
      "logitech-tap",
      "logitech-roommate",
    ],
    sections: [
      {
        heading: "What appliance mode takes off the bill of materials",
        body:
          "Run Zoom Rooms Appliances on CollabOS and three line items disappear: the mini PC, its Windows or macOS licence, and the mount and power it needed behind the display. What remains is the bar, the display, a controller and a network drop. The knock-on saving is operational — no OS patch cycle in the room, no antivirus exclusions, no image to rebuild. Firmware and health come through Logitech Sync and Zoom Device Management instead of your desktop toolchain.",
      },
      {
        heading: "Choosing hardware by room size on Zoom",
        body:
          "Rally Bar Huddle handles two-to-six-person spaces. Rally Bar Mini suits small and medium rooms where people sit close, using its ultra-wide 113° horizontal view. Rally Bar covers six-to-twelve-person rooms with motorised PTZ and 15x zoom. Rally Board 65 adds a 65-inch 4K touchscreen where the room needs a display and whiteboarding too. For a long boardroom table, Rally Plus brings an Ultra-HD PTZ camera, two speakers and mic pods that expand to seven for even coverage.",
      },
      {
        heading: "Controllers and how people actually join",
        body:
          "Zoom Rooms is at its best when the join is a single tap on a panel that is always on the table. Tap gives a 10.1-inch touchscreen wired over USB-C to the bar, with a motion sensor that wakes the room and an HDMI input for a guest laptop at 1080p — useful when a visitor cannot share into your Zoom account. Rooms with a single owner can run from the bar's remote, but any space on the booking system should have a panel.",
      },
      {
        heading: "Where a compute appliance still earns its place",
        body:
          "Appliance mode on the bar is the default, not the only answer. RoomMate runs Zoom Rooms Appliances on CollabOS and drives one or two displays, so it is the way to keep a dual-screen room, to reuse a USB camera such as Rally Camera or MeetUp, or to pair Rally Plus with a room host without introducing a PC. It also gives a mixed estate one management story, since RoomMate and the bars both report into Sync.",
      },
    ],
    faqs: [
      {
        q: "Is appliance mode better than running Zoom Rooms on a PC?",
        a: "For most rooms, yes. The bar becomes the endpoint, so you drop a computer, an operating system licence and the patching that comes with them, and the room boots into Zoom Rooms with nothing else to go wrong. A PC-based build is worth keeping only for unusual peripheral or software requirements that CollabOS does not host.",
      },
      {
        q: "What size of Zoom room does each Logitech bar cover?",
        a: "Rally Bar Huddle for two to six people, Rally Bar Mini for small and medium rooms, and Rally Bar once the table runs past roughly 4.5 metres. Rally Board 65 covers rooms that also need a touchscreen. Rally Plus is the boardroom option, because only modular mic pods cover a long table evenly.",
      },
      {
        q: "Can the same room run both Zoom Rooms and Teams?",
        a: "Yes — these Logitech devices host both platforms and you nominate which one the room runs, with mode switching available on some deployments. It is worth deciding a default per room rather than per user, because calendar integration and the controller layout follow the platform you choose. We set that up before delivery.",
      },
      {
        q: "What is Aplus responsible for on a Zoom Rooms deployment?",
        a: "Sourcing genuine Logitech hardware against a GST invoice, supplying mounts and cabling, installing and configuring the room in appliance mode with your Zoom account and calendar, and supporting it afterwards under AMC anywhere in India. Ask for the free installation assessment before you finalise quantities — room-by-room sizing usually changes the order.",
      },
    ],
    ctaHeading: "Deploying Zoom Rooms across your offices?",
  },
];

export function getVcRoomGuide(slug: string): VcRoomGuide | undefined {
  return vcRoomGuides.find((g) => g.slug === slug);
}
