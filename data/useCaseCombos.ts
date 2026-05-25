import type { CategorySlug } from "./categories";

export interface UseCase {
  title: string;
  description: string;
}

export interface ComboFaq {
  q: string;
  a: string;
}

/**
 * One programmatic landing page is generated per entry below.
 * URL: /solutions/{industry}/{category}
 *
 * Each combo is intentionally hand-written (not template-derived) so each page
 * carries unique value and avoids Google's doorway-page penalty.
 */
export interface UseCaseCombo {
  /** Solution slug — must match an entry in data/solutions.ts */
  industry: string;
  /** Category id — must match an entry in data/categories.ts */
  category: CategorySlug;

  /** SEO H1. Should be searchable, ~50-65 chars. */
  title: string;
  /** Hero subtitle, 1 sentence. */
  subtitle: string;
  /** ~50-word intro paragraph, used for meta description and hero body. */
  intro: string;

  /** 4-5 specific scenarios for this industry+category combo. */
  useCases: UseCase[];

  /** Industry-specific objections / questions. 3-4 entries. */
  faqs: ComboFaq[];

  /** Final CTA heading. */
  ctaHeading: string;
}

export const useCaseCombos: UseCaseCombo[] = [
  // ─── HOSPITALITY ──────────────────────────────────────────────────────────
  {
    industry: "hospitality",
    category: "digital-signage",
    title: "Digital Signage for Hotels & Hospitality",
    subtitle: "Wayfinding, lobby displays, and dynamic guest information — built for 16/7 reliability.",
    intro:
      "Samsung digital signage transforms hotel lobbies and corridors into dynamic, revenue-generating surfaces with automated wayfinding and day-parted menu boards.",
    useCases: [
      { title: "Lobby & Reception Signage", description: "Dynamic welcome displays with personalized messaging for VIPs and event groups." },
      { title: "Banquet & Conference Wayfinding", description: "Automated directional signage to streamline guest navigation during multi-event schedules." },
      { title: "F&B Menu Boards", description: "Automated, day-parted digital menus requiring zero manual intervention." },
      { title: "In-Lift & Corridor Displays", description: "Targeted brand storytelling and promotional content for high-dwell-time areas." },
      { title: "Spa & Recreation Promotions", description: "High-impact 4K visual merchandising to drive ancillary revenue." },
    ],
    faqs: [
      { q: "Can your signage run 16+ hours a day without burn-in?", a: "Yes. We deploy Samsung's commercial-grade panels (QHC, QMC, QH115 series) rated for 16/7 or 24/7 operation. Consumer TVs are not warranted for this duty cycle and will fail within months — we never sell them for signage applications." },
      { q: "Do you integrate with our existing CMS or PMS?", a: "Yes. Samsung MagicINFO supports API integration with major PMS platforms (Opera, IDS, Hotelogix) and event management systems. We also handle content scheduling on your behalf if you don't have an internal AV team." },
      { q: "How quickly can you deploy across multiple properties?", a: "For chains, we run pilots in 2-3 weeks and standardise rollouts at 5-8 properties per month. Pan-India delivery in 3-5 business days; installation teams operate in 50+ cities." },
      { q: "What about content management — do we need a dedicated person?", a: "No. MagicINFO templates let your marketing or front-office team update content remotely. For larger deployments, we offer managed content services with monthly retainers." },
    ],
    ctaHeading: "Planning a digital signage rollout for your hotel?",
  },
  {
    industry: "hospitality",
    category: "video-walls",
    title: "Video Walls for Hotel Lobbies & Hospitality",
    subtitle: "Floor-to-ceiling impact for arrivals, banquets, and brand storytelling.",
    intro:
      "Deliver unforgettable first impressions with seamless, ultra-narrow-bezel Samsung video walls designed for luxury lobbies and premium event spaces.",
    useCases: [
      { title: "Lobby Statement Walls", description: "Scalable configurations designed to elevate the guest arrival experience." },
      { title: "Banquet Pre-Function Areas", description: "A unified digital canvas for premium event branding and sponsorship displays." },
      { title: "Restaurant & Bar Backdrops", description: "Dynamic, schedule-driven visuals that seamlessly adapt to different dining periods." },
      { title: "Porte-Cochère & Driveway Displays", description: "High-visibility, weather-rated panels for impactful arrival and exterior branding." },
      { title: "Convention & MICE Spaces", description: "Highly configurable display systems to support rapid turnaround for diverse client events." },
    ],
    faqs: [
      { q: "What's the difference between LCD video walls and LED walls for hotel lobbies?", a: "LCD video walls (Samsung VM, VH series) are best for indoor lobbies up to ~5×3 metres — sharper at close viewing distance and significantly more affordable per square metre. Direct-view LED is the right choice when the canvas exceeds 6 metres or when bezels are unacceptable for the brand. We help you pick based on viewing distance and ambient light." },
      { q: "Is bezel visibility really a problem?", a: "Samsung's hospitality-grade video walls have 0.44 mm to 1.7 mm combined bezels — practically invisible beyond 3 metres. Compare this to consumer TVs tiled together (15-20 mm gaps) which immediately looks like a 'wall of TVs'." },
      { q: "How long does installation take?", a: "A typical 2×2 lobby wall installs in 1 day. 3×3 and above take 2-3 days including content commissioning. We coordinate with your operations team to schedule night-shift installations that don't disrupt guests." },
      { q: "What happens if one panel fails?", a: "Hot-swap. Samsung video wall panels are designed for front-access servicing — a replacement slots in within minutes without dismantling the whole wall. We stock spares in our Delhi-NCR, Mumbai, and Bangalore hubs for 24-hour replacement SLAs on AMC contracts." },
    ],
    ctaHeading: "Designing a lobby that earns its first impression?",
  },
  {
    industry: "hospitality",
    category: "interactive",
    title: "Interactive Kiosks for Hotels — Self Check-in & Concierge",
    subtitle: "Cut front-desk queues, upsell experiences, and serve guests in 12 languages.",
    intro:
      "Deploy self-service kiosks and digital concierges to streamline check-ins, automate wayfinding, and free your staff to focus on premium guest experiences.",
    useCases: [
      { title: "Self Check-in & Check-out Kiosks", description: "PMS-integrated terminals for automated key issuance and seamless payment processing." },
      { title: "Digital Concierge", description: "Multilingual interactive kiosks for self-serve reservations and localized recommendations." },
      { title: "Wayfinding & Floor Plans", description: "Intuitive, touch-enabled property navigation for large-scale resorts and venues." },
      { title: "Banquet Hall Selection Tools", description: "Immersive, large-format interactive displays for event planning and venue visualization." },
      { title: "F&B Pre-Order & Loyalty Sign-up", description: "Self-service touchpoints to accelerate loyalty enrollment and ancillary purchases." },
    ],
    faqs: [
      { q: "Can the kiosk integrate with our PMS for real room-key issuance?", a: "Yes. Samsung interactive displays run a full Android-class OS (Tizen 7.0+) and host vendor PMS apps directly. We've integrated with Opera Cloud, IDS Next, and Hotelogix — and can build custom REST integrations where needed." },
      { q: "Is touch reliable in a 24/7 hotel lobby environment?", a: "Yes. We deploy Samsung WAC and WAD series with hardened anti-glare glass and projected-capacitive touch rated for 50,000+ hours. Cleaning is a normal microfiber wipe — no special procedures." },
      { q: "What about guests who don't speak English?", a: "Standard deployments include English, Hindi, and 3-4 regional languages of your choice. Adding more is a configuration change, not a hardware change. International chains often run 12-15 languages." },
      { q: "Will this replace our front-desk staff?", a: "It redeploys them. Properties that use kiosks see front-desk staff shift from transaction processing to genuine guest interaction — concierge, upsells, complaint resolution. Guest satisfaction scores typically rise." },
    ],
    ctaHeading: "Cut front-desk queues and free staff for what matters?",
  },
  {
    industry: "hospitality",
    category: "commercial-tv",
    title: "Hotel TVs & In-Room Entertainment (HG Series)",
    subtitle: "Samsung Hospitality TVs with personalisation, Chromecast built-in, and PMS integration.",
    intro:
      "Enterprise-grade Samsung Hospitality TVs feature seamless PMS integration and native BYOD casting, built to withstand 24/7 hotel environments.",
    useCases: [
      { title: "In-Room Entertainment with Casting", description: "Seamless BYOD casting capabilities requiring no app installations or complex pairing." },
      { title: "Personalised Welcome Screens", description: "PMS-driven custom greetings and tailored offers upon guest arrival." },
      { title: "Hotel Services Browser", description: "Integrated digital directory for room service, spa bookings, and housekeeping requests." },
      { title: "Mini-Bar & F&B Promotions", description: "Automated, day-parted promotional content to drive on-property dining." },
      { title: "Multi-Property Standardisation", description: "Centralized fleet management for consistent branding and firmware across all locations." },
    ],
    faqs: [
      { q: "Why not just use a regular TV with a Chromecast?", a: "Consumer TVs power-cycle hundreds of times daily in a hotel and burn out their power boards within 12-18 months. They also don't support 'Hotel Mode' — locked channel lists, no guest access to factory reset, automatic logout of streaming apps between guests. Samsung HG-series TVs are warranted for this duty cycle and ship with hotel mode built in." },
      { q: "Do guests have to log into their own Netflix?", a: "Yes — and that's a feature. Samsung's Smart Cast lets them mirror from their own phone (Netflix, Disney+, Prime, YouTube) without entering passwords on the TV. On checkout, all session data wipes automatically. No more credentials left behind." },
      { q: "What about chains with mixed-vintage TVs across properties?", a: "Samsung LYNK REACH lets you manage HG-series TVs from multiple generations through a single dashboard. You can phase in new models without ripping out the fleet — the management surface is identical." },
      { q: "What about local channels and DTH integration?", a: "Standard. We integrate with Tata Play, Airtel Digital TV, and IPTV operators commonly used in Indian hotels. Channel lists are locked so guests can't reorder them." },
    ],
    ctaHeading: "Refreshing your hotel TVs — single property or across a chain?",
  },

  // ─── CORPORATE ────────────────────────────────────────────────────────────
  {
    industry: "corporate",
    category: "digital-signage",
    title: "Corporate Digital Signage for Offices & Workplaces",
    subtitle: "Lobbies, internal comms, meeting room schedulers, and town-hall displays.",
    intro:
      "Modernize internal communications with centralized digital signage for visitor welcomes, KPI dashboards, and calendar-integrated meeting room displays.",
    useCases: [
      { title: "Reception & Visitor Welcome", description: "Calendar-integrated digital greetings to elevate the corporate visitor experience." },
      { title: "Meeting Room Schedulers", description: "Real-time room availability displays with instant at-door booking capabilities." },
      { title: "Town-Hall & Cafeteria Displays", description: "Centralized broadcast networks for all-hands meetings and enterprise-wide communications." },
      { title: "KPI & Operations Dashboards", description: "Live data visualization from enterprise platforms for operational transparency." },
      { title: "Wayfinding for Multi-Floor Campuses", description: "Scalable navigational displays for complex corporate and campus environments." },
    ],
    faqs: [
      { q: "Can it integrate with Outlook / Google Workspace for meeting rooms?", a: "Yes. Standard integration with Microsoft 365, Google Workspace, and Robin/Teem booking systems. The display reflects calendar status in real time and lets walk-ups book free slots." },
      { q: "Who manages the content after install?", a: "Your call. Most clients have an internal comms or marketing person own MagicINFO. We train them in a 2-hour session. For smaller teams, we offer managed content services with monthly content refresh." },
      { q: "Does it work over our corporate VPN / locked-down network?", a: "Yes. Samsung signage supports proxy authentication, 802.1x certificate-based network access, and runs comfortably behind enterprise firewalls. Our deployment team works directly with your IT security to whitelist the necessary endpoints." },
      { q: "What about display content during off-hours?", a: "Schedules can switch to power-save, after-hours messaging, or fully off. Power consumption matters — Samsung commercial panels are ~30% more efficient than equivalent consumer TVs over an 8-hour workday." },
    ],
    ctaHeading: "Standardising signage across your offices?",
  },
  {
    industry: "corporate",
    category: "video-walls",
    title: "Corporate Video Walls — Control Rooms, Lobbies & Executive Briefing",
    subtitle: "Mission-critical 24/7 walls and statement lobby installations.",
    intro:
      "From 24/7 mission-critical operations centers to high-impact HQ statement lobbies, Samsung video walls deliver uncompromised reliability and visual scale.",
    useCases: [
      { title: "Security Operations Centres (SOCs)", description: "High-resolution, multi-source displays for critical threat monitoring and incident response." },
      { title: "Network Operations Centres (NOCs)", description: "Mission-critical 24/7 visualization walls featuring redundant power and failover systems." },
      { title: "Executive Briefing Centres", description: "Immersive, seamless digital canvases designed for high-stakes corporate presentations." },
      { title: "Trading Floor & Dealing Rooms", description: "High-brightness, multi-source arrays engineered for demanding financial environments." },
      { title: "HQ Lobby Brand Walls", description: "Architectural statement displays to reinforce corporate identity at the point of entry." },
    ],
    faqs: [
      { q: "What's the difference between SOC-grade and lobby-grade video walls?", a: "SOC walls (VHC/VHB series) are 24/7 rated, ~700 nits brightness, with redundant power supplies and hot-swappable PSUs. Lobby walls (VMB series) are 16/7 rated, lower nits, less expensive — appropriate for environments that aren't manned overnight. Picking the wrong tier wastes 30-40% of budget or causes mid-life failures." },
      { q: "Can you do video processing — multiple sources, picture-in-picture?", a: "Yes. We integrate with Datapath, RGB Spectrum, and Userful video wall processors for multi-source layouts, KVM control, and remote operator access. Software-only processors work for up to 4×4; hardware processors for larger walls." },
      { q: "What about content during emergencies — fire alarms, evacuation?", a: "Walls can be wired to fire panel inputs and switch instantly to evacuation maps and instructions. We've done this for IT parks and large campuses where the wall becomes part of life-safety messaging." },
      { q: "How do you handle 24/7 operation reliability?", a: "Three things: 24/7-rated panels (not 16/7), N+1 power redundancy on the wall and processor, and an AMC contract with 4-hour on-site response in metros. We carry spare panels in our regional hubs." },
    ],
    ctaHeading: "Designing a 24/7 control room or statement lobby?",
  },
  {
    industry: "corporate",
    category: "interactive",
    title: "Interactive Displays for Meeting Rooms (Samsung Flip)",
    subtitle: "Touch-driven whiteboarding, wireless presentation, and hybrid video calls — without the dongle drama.",
    intro:
      "Consolidate your meeting room technology with interactive displays that combine wireless casting, touch whiteboarding, and hybrid conferencing in one device.",
    useCases: [
      { title: "Huddle Rooms", description: "Compact interactive displays optimized for agile collaboration and rapid unified communications." },
      { title: "Boardrooms", description: "Large-format interactive systems supporting dual-display hybrid conferencing." },
      { title: "Training Rooms", description: "Engaging interactive platforms designed for hybrid facilitator-led sessions." },
      { title: "Design & Engineering Reviews", description: "High-fidelity 4K touch canvases for precision technical and architectural workflows." },
      { title: "Customer Briefing Rooms", description: "Premium interactive surfaces engineered to drive impactful client demonstrations." },
    ],
    faqs: [
      { q: "How is this different from a Microsoft Surface Hub or Google Jamboard?", a: "Samsung Flip runs without a Microsoft 365 dependency — it works on any network with any laptop. Surface Hub locks you into the Microsoft ecosystem; Jamboard was discontinued in 2024. Flip's content-sharing layer is platform-agnostic (Windows, Mac, iOS, Android all cast to it natively)." },
      { q: "Can guests share from their laptops without installing software?", a: "Yes. Samsung's wireless screen sharing (Smart View, AirPlay, Miracast) works without any installed agent. Guests connect to the meeting room WiFi and cast in <10 seconds." },
      { q: "Does it work with Zoom/Teams/Google Meet?", a: "Yes — all three. We standardise on whichever your organisation uses. Some clients run BYOM (bring-your-own-meeting) where the laptop is the conferencing host and the Flip is purely the display + camera." },
      { q: "What about whiteboard archival — can we save sessions?", a: "Standard. Whiteboard sessions auto-email to all attendees, save to network drives, or push to OneDrive/Google Drive. We configure this during deployment so it Just Works without anyone having to remember." },
    ],
    ctaHeading: "Upgrading your meeting rooms across multiple offices?",
  },
  {
    industry: "corporate",
    category: "commercial-tv",
    title: "Commercial TVs for Offices, Reception & Break Areas",
    subtitle: "Samsung BE-series — designed for office duty cycles, not living rooms.",
    intro:
      "Samsung's BE-series commercial TVs deliver the durability and centralized scheduling required for demanding 12-hour office duty cycles.",
    useCases: [
      { title: "Reception & Lobby TVs", description: "Automated digital signage for dynamic visitor greetings and corporate messaging." },
      { title: "Cafeteria & Break Area Displays", description: "Centralized internal communications networks for scheduled corporate broadcasts." },
      { title: "Department Information Boards", description: "Localized, team-specific digital dashboards for operational alignment." },
      { title: "Recruitment & Visitor Lounges", description: "Curated brand storytelling displays designed for candidate and partner engagement." },
      { title: "Training & Library Spaces", description: "Deployable commercial displays for ad-hoc departmental training requirements." },
    ],
    faqs: [
      { q: "Why not just buy a regular Samsung TV from a retail store?", a: "Commercial BE-series TVs include features your office actually needs: USB-based content playback, RS-232 / IP control for centralised power on/off, hotel-mode lockouts that prevent staff from changing inputs or installing apps, and a 3-year commercial warranty that covers business use (residential warranties exclude commercial use)." },
      { q: "Can we play USB content without a media player or PC?", a: "Yes. Plug in a USB with images/videos and BE-series TVs auto-play in a loop. Simplest possible signage workflow — no software, no licences, no failure modes." },
      { q: "Do they support central scheduling — power on at 8 AM, off at 7 PM?", a: "Yes. RS-232 or network commands let your IT team schedule power cycles centrally. This alone typically saves 30-40% on power bills versus TVs left on all night." },
      { q: "What sizes do you recommend for offices?", a: "Reception areas: 55-65\". Cafeterias: 65-75\". Department info boards: 43-55\". We size by viewing distance and room shape during the site survey." },
    ],
    ctaHeading: "Rolling out commercial TVs across multiple office locations?",
  },

  // ─── EDUCATION ────────────────────────────────────────────────────────────
  {
    industry: "education",
    category: "digital-signage",
    title: "Digital Signage for Schools, Colleges & Universities",
    subtitle: "Campus wayfinding, exam schedules, event boards, and emergency alerts.",
    intro:
      "Replace static campus notice boards with dynamic digital signage for real-time exam schedules, wayfinding, and centralized emergency alerts.",
    useCases: [
      { title: "Main Entrance Displays", description: "Dynamic campus orientation and event highlights for students and visitors." },
      { title: "Exam Schedules & Timetables", description: "Real-time, automated scheduling displays to streamline academic operations." },
      { title: "Digital Notice Boards", description: "Centralized rich-media broadcasting to replace decentralized static campus announcements." },
      { title: "Campus Wayfinding", description: "Comprehensive digital directories for multi-building institutional navigation." },
      { title: "Emergency Alert Integration", description: "Centralized network override capabilities for critical campus-wide safety broadcasts." },
    ],
    faqs: [
      { q: "Are these tough enough for student environments?", a: "Yes. We use Samsung QBC/QBR/QMR series with toughened front glass for high-traffic zones. Touch and walk-by environments use anti-vandal protective frames where needed. Failure rates in school deployments are under 2% per year — significantly better than projectors in the same environment." },
      { q: "Can student council / clubs post their own content?", a: "Yes — with workflow approval. MagicINFO supports user roles where club leads can draft content and the admin/principal approves before it goes live. This balances student involvement with brand safety." },
      { q: "How does emergency alert integration work?", a: "All displays can be overridden with one command (or triggered by fire alarm panels) to show evacuation routes and instructions. We've deployed this for residential schools and university hostels where seconds matter." },
      { q: "What about content for parents during events — sports day, annual day?", a: "Walk-up registration, photo upload, and event schedules. Some clients pipe live scoreboard data to displays during inter-school competitions. The signage layer is flexible enough to handle one-off event needs." },
    ],
    ctaHeading: "Modernising your campus signage and notice boards?",
  },
  {
    industry: "education",
    category: "video-walls",
    title: "Video Walls for Auditoriums & University Spaces",
    subtitle: "Auditorium backdrops, sports facility displays, and convocation hall installations.",
    intro:
      "Equip auditoriums and convocation halls with high-brightness, seamless video walls that overcome venue lighting and ensure perfect visibility.",
    useCases: [
      { title: "Auditorium Stage Backdrops", description: "Dynamic, reconfigurable digital backdrops for academic events and guest lectures." },
      { title: "Convocation Halls", description: "High-impact visual canvases designed for premium institutional ceremonies." },
      { title: "Sports Facility Displays", description: "Integrated media walls for live scoring, instant replay, and sponsorship activation." },
      { title: "Library Atriums", description: "Informational displays for academic programming and institutional announcements." },
      { title: "Innovation & Research Centers", description: "High-resolution data visualization walls for showcasing institutional research." },
    ],
    faqs: [
      { q: "Why not just use a large projector for the auditorium?", a: "Projectors wash out under house lights and need darkening. Video walls work in fully lit rooms — important for ceremonies where the audience needs to see each other and the stage simultaneously. Projector lamps also need replacement every 2-3 years; LCD walls run 10+ years on the same panels." },
      { q: "How big does the wall need to be for a 500-seat auditorium?", a: "Rule of thumb: wall width = 1/6 of room depth. A 30m-deep auditorium wants a ~5m wide wall. We do the math during the site survey factoring in seat height, sightlines, and content type (text vs imagery)." },
      { q: "Can it handle live event production — multi-camera switching?", a: "Yes. We integrate with broadcast switchers (NewTek TriCaster, BlackMagic ATEM) so the AV team running events can switch sources, add lower thirds, and run picture-in-picture for speakers + slides." },
      { q: "What about institutional budget constraints — can we phase this?", a: "Often yes. Many universities start with one auditorium per year, prioritising the highest-traffic venue (convocation hall first, then main auditorium, then sports facility). We standardise the platform so spare panels are interchangeable across deployments." },
    ],
    ctaHeading: "Designing an auditorium or convocation hall installation?",
  },
  {
    industry: "education",
    category: "interactive",
    title: "Interactive Smart Boards for Classrooms (Samsung Flip & WAC)",
    subtitle: "Replace chalk, whiteboard, and projector with one device — touch, write, share, save.",
    intro:
      "Transform classrooms with interactive smart boards that combine multi-touch collaboration, integrated lesson recording, and instant wireless screen sharing.",
    useCases: [
      { title: "K-12 Classrooms", description: "Interactive pedagogical platforms engineered for full-class engagement and split-screen collaboration." },
      { title: "Higher Education Lecture Halls", description: "Large-format, high-fidelity interactive displays for advanced academic disciplines." },
      { title: "Computer Labs", description: "Centralized demonstration screens optimized for software instruction and technical training." },
      { title: "Faculty Training Rooms", description: "Integrated professional development suites featuring automated session archiving." },
      { title: "Special Education Resources", description: "Accessible, height-adjustable interactive interfaces tailored for diverse learning requirements." },
    ],
    faqs: [
      { q: "How does this compare to a projector + whiteboard setup?", a: "Projector setups have three failure points (projector lamp, screen surface, connected PC) and require lights dimmed. Interactive flat panels are a single device, lamp-free, work in fully lit rooms, and the touch layer means teachers interact directly without going to the laptop. Total cost of ownership over 7 years typically favours the flat panel." },
      { q: "Do teachers need training to use it?", a: "Less than you'd expect. The touch interface mirrors a giant tablet. We do a 60-90 minute onboarding per school covering the most common workflows (whiteboarding, casting from laptop, exporting notes). Most teachers are productive on day one." },
      { q: "Can it integrate with our LMS — Google Classroom, Moodle?", a: "Yes. Samsung interactive displays support Google Classroom, Microsoft Education, Moodle, and Canvas via standard browser-based interfaces. Lesson recordings and whiteboard exports push directly to the LMS." },
      { q: "How robust is the touch surface for daily K-12 use?", a: "Toughened glass rated for 50,000+ touch hours. We've not seen surface damage in 5+ years of deployments. The Android-class OS does need periodic updates (we handle this during school vacations)." },
    ],
    ctaHeading: "Modernising your classrooms across the campus?",
  },
  {
    industry: "education",
    category: "commercial-tv",
    title: "Commercial TVs for Hostels, Common Areas & Student Lounges",
    subtitle: "Durable TVs built for shared student spaces — not retail consumer panels.",
    intro:
      "Samsung's BE-series commercial TVs are built for the heavy demands of student spaces. They offer locked-down menus to prevent unauthorized changes, central power scheduling, and longer warranties—ensuring durability where standard retail TVs fail.",
    useCases: [
      { title: "Hostel Common Rooms", description: "Durable, centrally managed displays with restricted channel access for shared student spaces." },
      { title: "Mess & Dining Halls", description: "Automated digital menu boards and institutional messaging systems." },
      { title: "Recreation Areas", description: "Large-format commercial displays featuring centralized power scheduling." },
      { title: "Visitor Lounges", description: "Automated digital signage for parent and guest communications." },
      { title: "Library Study Spaces", description: "Optimized commercial displays configured for academic reference environments." },
    ],
    faqs: [
      { q: "Why commercial TVs over regular consumer models for hostels?", a: "Three reasons: warranty (consumer warranty excludes shared-use environments), lockdown (students can't reset to factory or install unauthorised apps on commercial models), and central control (RS-232/IP scheduling for power on/off times). The 30-40% price premium pays back through lower failure rates." },
      { q: "Can we schedule on/off times automatically?", a: "Yes. Set 'TV on' for 6 AM, 'off' at 11 PM (or whatever your hostel rules require). Saves electricity and reduces wear on the panel. Scheduling is done from a central admin console for the whole fleet." },
      { q: "What about content control — keeping it appropriate?", a: "Channel lists can be locked. Streaming apps can be disabled or restricted to whitelisted ones. We configure this during deployment based on the institution's policies." },
      { q: "How do you handle damage in shared spaces?", a: "Wall-mount with anti-theft brackets, glass overlays for high-risk areas, and AMC contracts that cover physical damage (vs. residential warranties which exclude it). We've deployed in 200+ schools and hostels — failure rates are low." },
    ],
    ctaHeading: "Equipping hostels and common areas with durable TVs?",
  },

  // ─── RETAIL ───────────────────────────────────────────────────────────────
  {
    industry: "retail",
    category: "digital-signage",
    title: "Retail Digital Signage — Storefronts, Menu Boards & In-Store Promo",
    subtitle: "Window displays, shelf-edge promotions, and QSR menu boards that day-part automatically.",
    intro:
      "Drive footfall and accelerate ROI with high-brightness storefront displays and automated digital menu boards built for retail environments.",
    useCases: [
      { title: "Storefront Displays", description: "Ultra-high-brightness commercial panels engineered for direct-sunlight visibility." },
      { title: "QSR Menu Boards", description: "Fully automated, day-parted digital menu systems for streamlined quick-service operations." },
      { title: "Mall Atriums", description: "High-impact advertising networks for premium tenant and landlord promotions." },
      { title: "End-Cap Promotions", description: "Targeted point-of-sale digital merchandising to drive product awareness." },
      { title: "Fitting Room Engagement", description: "Interactive styling and upselling displays to maximize customer basket size." },
    ],
    faqs: [
      { q: "How bright does a storefront display need to be in direct sunlight?", a: "Minimum 2,500 nits for sun-facing windows. Samsung's QPDX (~3,500 nits) and QH115 (5,000 nits) are designed for this — standard 350-nit signage panels wash out completely. We do a brightness assessment during the site survey based on glass tinting and orientation." },
      { q: "How do day-parted menus work — does someone change them manually?", a: "Fully automated. You define schedules (e.g., breakfast 6-11 AM, lunch 11-3, all-day after) and the menu switches itself. Promotional overlays (today's combo, happy hour) layer on top of the base menu. Most QSR chains never touch the menus after initial setup." },
      { q: "Can we run different content per store?", a: "Yes. MagicINFO supports store-group hierarchies — corporate runs base content, regional managers add city-specific promotions, individual store managers can override for local events. Edit-control flows downward; reporting flows upward." },
      { q: "What about A/B testing — does new pricing actually drive sales?", a: "Yes. We integrate with POS data so you can correlate menu changes with same-day sales lifts. Some clients run weekly experiments — promote item A this week, item B next week, measure the delta. This is where digital signage pays back fastest." },
    ],
    ctaHeading: "Rolling out signage across retail stores or QSR locations?",
  },
  {
    industry: "retail",
    category: "video-walls",
    title: "Video Walls for Flagship Retail & Shopping Centres",
    subtitle: "Statement walls for brand experience, atrium centrepieces, and immersive product launches.",
    intro:
      "Create destination-worthy retail experiences with seamless, high-brightness video walls designed to captivate shoppers in highly lit environments.",
    useCases: [
      { title: "Flagship Store Atriums", description: "Large-scale architectural video walls designed for premium retail destinations." },
      { title: "Brand Experience Zones", description: "Customizable, multi-panel configurations for immersive experiential marketing." },
      { title: "Mall Centre-Courts", description: "High-visibility anchor displays for seasonal programming and premium advertising." },
      { title: "Product Launch Environments", description: "Rapidly reconfigurable digital canvases to support dynamic retail marketing calendars." },
      { title: "Shop-Front Displays", description: "High-impact, multi-panel window installations for 24/7 brand visibility." },
    ],
    faqs: [
      { q: "Bezel-less LED versus LCD video walls for retail — which is right?", a: "For close viewing (within 3m, common in store interiors), LCD walls with 0.44-1.7mm combined bezels are sharper, cheaper, and easier to service. Direct-view LED is correct for atriums where viewing distance exceeds 5m and the canvas is large (12+ square metres). We size the comparison during the site survey — sometimes a hybrid is the right answer." },
      { q: "How quickly can the wall content change during a season — Diwali, Christmas, end-of-season-sale?", a: "Hours, not days. Content schedules are pre-loaded weeks in advance and switch automatically at the configured date and time. For unplanned changes (flash sales, last-minute pricing), edits push in real time from the central console." },
      { q: "What about glare from store lighting?", a: "Samsung commercial walls ship with anti-glare panel coatings. Lighting design matters too — we work with your lighting consultants during install to avoid lamps angled directly at the wall surface." },
      { q: "Can the wall integrate with our digital marketing campaigns?", a: "Yes. Tag-driven content swaps based on time-of-day, weather, or campaign feed APIs. Some clients integrate with their CRM to surface different content when a loyalty member is identified at the door (with their consent)." },
    ],
    ctaHeading: "Planning a flagship store or mall atrium installation?",
  },
  {
    industry: "retail",
    category: "interactive",
    title: "Interactive Kiosks for Retail — Endless Aisle & Self-Service",
    subtitle: "Touch displays that turn store footprint into a 10x larger catalogue.",
    intro:
      "Deploy interactive endless-aisle kiosks to expand in-store catalogs, accelerate checkouts, and capture valuable omnichannel retail data.",
    useCases: [
      { title: "Endless Aisle Kiosks", description: "Omnichannel inventory interfaces enabling in-store access to expanded product catalogs." },
      { title: "Self-Checkout Terminals", description: "Automated point-of-sale kiosks to accelerate transaction times and reduce queueing." },
      { title: "Loyalty Integration", description: "Self-service touchpoints for rapid loyalty program enrollment and data capture." },
      { title: "Product Configurators", description: "Interactive visual configuration tools for customized and made-to-order merchandise." },
      { title: "Retail Wayfinding", description: "Intuitive digital directories for complex big-box and multi-tenant environments." },
    ],
    faqs: [
      { q: "Will customers actually use a touch kiosk instead of asking staff?", a: "Yes, especially Gen Z and millennial shoppers — they often prefer kiosks for routine queries (where is X, do you have my size in Y) and turn to staff only for complex needs. We've seen 40-60% usage rates within 60 days of deployment in fashion retail." },
      { q: "How does it integrate with our store stock and online catalogue?", a: "Standard REST API integration with Shopify, Magento, custom ERPs, and major retail POS systems. The kiosk shows real stock status (in-store, available online, ship-from-warehouse) and lets customers reserve or buy on the spot." },
      { q: "What about credit-card payment on the kiosk?", a: "Yes. PCI-compliant integration with Pine Labs, Razorpay, and PayU for card and UPI payments directly on the kiosk. We handle the payment-rail integration end-to-end." },
      { q: "Reliability in a 12-hour-a-day, 7-day-a-week retail environment?", a: "Samsung WAC/WAD touch panels are rated for this use. Industry failure rate is ~1-2% per year. Our AMC contracts include 24-hour replacement SLAs in metros." },
    ],
    ctaHeading: "Adding interactive kiosks to your retail or QSR locations?",
  },
  {
    industry: "retail",
    category: "commercial-tv",
    title: "Commercial TVs for Retail Back-of-House & Staff Areas",
    subtitle: "Durable TVs for stockrooms, staff lounges, and operations back rooms.",
    intro:
      "Equip retail back-of-house operations with durable commercial displays optimized for shift briefings, KPI dashboards, and staff training.",
    useCases: [
      { title: "Operations Dashboards", description: "Real-time visualization of inventory metrics, logistics, and shift KPIs." },
      { title: "Staff Break Areas", description: "Centrally managed networks for corporate communications and training content." },
      { title: "Manager's Office", description: "Reliable commercial displays for security monitoring and operational oversight." },
      { title: "Training Facilities", description: "Dedicated commercial displays for standardized retail staff onboarding." },
      { title: "Loading Bay Coordination", description: "Ruggedized scheduling displays for streamlined inbound logistics management." },
    ],
    faqs: [
      { q: "We just need basic TVs for the stockroom — why commercial?", a: "Retail stockrooms run TVs 12+ hours a day. Consumer TVs warranty exclude business use — first failure and you're paying out of pocket. The 30% commercial premium pays for warranty coverage that actually applies, plus central power scheduling that consumer models don't offer." },
      { q: "What's the difference for shift-briefing displays vs customer-facing signage?", a: "Back-of-house can use slightly lower brightness panels (BE-series, ~300 nits) because lighting is controlled. Customer-facing signage needs higher brightness (QHC-series ~400 nits) for storefront and mall conditions. Picking the wrong tier wastes 20-30% of budget." },
      { q: "Can we centrally control on/off times across all stores?", a: "Yes. Network-based scheduling lets head office push power-cycle commands to the full fleet. Stores open at 10 AM → TVs on at 9:45 AM. Stores close at 9 PM → TVs off at 9:15 PM. Saves 30-40% on power bills." },
      { q: "What about staff training content management?", a: "Samsung MagicINFO supports back-of-house playlists for training content (compliance, product knowledge, safety) that loop during specific hours. Or we plug into your LMS so e-learning content plays directly on the break-room TV." },
    ],
    ctaHeading: "Outfitting retail back-of-house across multiple locations?",
  },
];

export function getCombo(
  industry: string,
  category: CategorySlug
): UseCaseCombo | undefined {
  return useCaseCombos.find(
    (c) => c.industry === industry && c.category === category
  );
}
