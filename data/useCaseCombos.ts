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
      "Samsung digital signage for hospitality transforms lobbies, banquet halls, and corridors into branded, revenue-generating surfaces. Our installations span boutique properties to 500-key hotels — from arrival wayfinding to F&B menu boards that switch automatically between breakfast, lunch, and bar service.",
    useCases: [
      { title: "Lobby & Reception Signage", description: "Welcome screens with personalised messaging for VIP arrivals, conference groups, and weddings." },
      { title: "Banquet & Conference Wayfinding", description: "Auto-updating directional displays for multi-event days — eliminate printed standees and last-minute reprints." },
      { title: "F&B Menu Boards", description: "Day-parted menus that switch from breakfast to all-day dining to bar pricing without staff intervention." },
      { title: "In-Lift & Corridor Displays", description: "Brand storytelling and event promotions delivered to captive guest audiences." },
      { title: "Spa & Recreation Promotions", description: "Drive ancillary revenue with vivid 4K visuals for spa, pool, and excursion bookings." },
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
      "Hotel video walls are no longer just decoration — they're the first impression that justifies your room rate. We install seamless, ultra-narrow-bezel Samsung video walls in lobbies, banquet pre-function areas, and luxury retail concessions where individual displays would feel undersized.",
    useCases: [
      { title: "Lobby Statement Walls", description: "2×2 to 5×5 configurations that turn the check-in moment into an experience." },
      { title: "Banquet Pre-Function Areas", description: "Single large canvas for wedding mood reels, corporate event branding, and sponsor logos." },
      { title: "Restaurant & Bar Backdrops", description: "Mood-driven visuals that change with service period — coffee morning to cocktail evening." },
      { title: "Porte-Cochère & Driveway Displays", description: "Outdoor-rated panels for arrival branding visible to vehicles approaching the property." },
      { title: "Convention & MICE Spaces", description: "Configurable walls that brand for one client today and another tomorrow." },
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
      "Samsung interactive displays let hotels deploy self-service check-in, digital concierge, and wayfinding kiosks that work even at 2 AM. Our hospitality clients see 30-40% of arrivals self-check-in within 90 days of deployment — freeing front-desk staff to handle exceptions and upsells.",
    useCases: [
      { title: "Self Check-in & Check-out Kiosks", description: "PMS-integrated kiosks issue room keys and accept payment for late checkouts, mini-bar, and damages." },
      { title: "Digital Concierge", description: "Interactive city guides, restaurant booking, and excursion sales with multi-language support." },
      { title: "Wayfinding & Floor Plans", description: "Touch-driven property maps for sprawling resorts and convention centres." },
      { title: "Banquet Hall Selection Tools", description: "Wedding and event planners explore halls, capacities, and decor options on a 75-inch interactive canvas." },
      { title: "F&B Pre-Order & Loyalty Sign-up", description: "Drive ancillary revenue by letting guests pre-order spa, F&B, and loyalty enrolment from the lobby." },
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
      "Samsung Hospitality TVs are purpose-built for hotel rooms — they survive 24/7 power cycles, support enterprise content management, and let guests cast from their own phones without WiFi pairing battles. We deploy across boutique, mid-market, and luxury segments with PMS integration done end-to-end.",
    useCases: [
      { title: "In-Room Entertainment with Casting", description: "Guests cast Netflix, YouTube, and personal streaming from their phones — no app installs, no pairing." },
      { title: "Personalised Welcome Screens", description: "Custom greeting with guest name, room number, and tailored offers from the PMS." },
      { title: "Hotel Services Browser", description: "Order room service, book spa, request housekeeping — all from the TV remote." },
      { title: "Mini-Bar & F&B Promotions", description: "Day-parted promotions for breakfast buffet, sundowner cocktails, and dinner reservations." },
      { title: "Multi-Property Standardisation", description: "Centralised management across properties via Samsung LYNK REACH — push firmware, channels, and branding from one console." },
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
      "Modern offices use digital signage for visitor welcomes, real-time KPI dashboards, internal communications, and meeting-room availability. Samsung's QHC/QMC commercial signage replaces print noticeboards with always-current content controllable from anywhere — and integrates with the calendaring systems your office already runs.",
    useCases: [
      { title: "Reception & Visitor Welcome", description: "Personalised greetings for client visits — names auto-pulled from Outlook calendar invites." },
      { title: "Meeting Room Schedulers", description: "Outside-door displays show booking, occupant, and end time — book-on-the-spot for free slots." },
      { title: "Town-Hall & Cafeteria Displays", description: "All-hands streams, leadership messages, and HR announcements pushed company-wide." },
      { title: "KPI & Operations Dashboards", description: "Live data from Salesforce, Jira, or PowerBI piped to wall displays in sales bullpens and ops rooms." },
      { title: "Wayfinding for Multi-Floor Campuses", description: "Interactive and static wayfinding for IT parks, corporate campuses, and innovation centres." },
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
      "Corporate video walls split into two distinct use cases: 24/7 mission-critical (security operations centres, NOCs, trading floors) and statement lobbies (HQ branding, executive briefing centres). Samsung's VMB/VHC/VHB lines cover both — we'll match the right panel to your duty cycle and viewing distance.",
    useCases: [
      { title: "Security Operations Centres (SOCs)", description: "Multi-source 4K walls for live camera feeds, threat intelligence dashboards, and incident response." },
      { title: "Network Operations Centres (NOCs)", description: "24/7 monitoring walls for global infrastructure, with redundant power and panel-level failover." },
      { title: "Executive Briefing Centres", description: "Customer demo theatres with seamless walls that showcase product roadmaps and pitch decks at scale." },
      { title: "Trading Floor & Dealing Rooms", description: "High-brightness panels visible across long, lit floors with multi-source video processing." },
      { title: "HQ Lobby Brand Walls", description: "Statement installations at headquarters reception that anchor the brand story for visitors and recruits." },
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
      "Samsung Flip and WAC/WAD interactive displays replace the trifecta of whiteboard, projector, and conferencing camera with one device. Walk into the room, tap to start, share wirelessly from any laptop, and the whiteboard session emails itself to attendees automatically. Built for the way meetings actually happen now.",
    useCases: [
      { title: "Huddle Rooms (4-6 people)", description: "55-65\" Samsung Flip 2 / WAC for quick whiteboarding and Zoom/Teams calls without booking a big room." },
      { title: "Boardrooms (10-20 people)", description: "85\" Flip Pro or WAFX with dual displays for content + camera view on hybrid calls." },
      { title: "Training Rooms", description: "Large interactive displays for facilitator-led sessions with simultaneous remote attendees." },
      { title: "Design & Engineering Reviews", description: "4K interactive canvas for code reviews, architecture diagrams, and CAD walkthroughs." },
      { title: "Customer Briefing & Demo Rooms", description: "Polished interactive surfaces for sales conversations and product demos." },
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
      "Office reception TVs, cafeteria displays, and break-area screens see far harder use than residential — they're on 10-12 hours a day, often unsupervised. Samsung's BE-series (BEA, BEC, BED, BEFX) commercial TVs are warranted for this duty and ship with content-management features consumer TVs don't have.",
    useCases: [
      { title: "Reception & Lobby TVs", description: "Welcome screens that auto-update with the day's visitors and company news." },
      { title: "Cafeteria & Break Area Displays", description: "Internal comms loops, lunch menus, and live news feeds during break hours." },
      { title: "Department Information Boards", description: "Team-specific dashboards in engineering, sales, and operations bullpens." },
      { title: "Recruitment & Visitor Lounges", description: "Branded content loops for waiting candidates and visiting partners." },
      { title: "Training & Library Spaces", description: "Reservable TV displays for ad-hoc training sessions and content review." },
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
      "Educational campuses are sprawling, multi-building environments where printed notice boards go ignored. Samsung digital signage replaces the dusty cork board with always-current, eye-catching displays for exam schedules, event announcements, wayfinding, and emergency alerts — controllable from a single admin console.",
    useCases: [
      { title: "Reception & Main Entrance Displays", description: "Welcome screens for parents, visitors, and prospective students with today's events highlighted." },
      { title: "Exam Schedules & Time Tables", description: "Auto-updating displays outside examination halls — eliminate confusion and last-minute reprints." },
      { title: "Event & Notice Boards", description: "Replace static cork boards with rich-media displays that students actually look at." },
      { title: "Wayfinding Across Campus", description: "Multi-building campus maps with department, lab, and lecture-hall directories." },
      { title: "Emergency Alert Integration", description: "Instant takeover of all campus displays for evacuation, severe weather, or security incidents." },
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
      "University auditoriums, convocation halls, and sports facilities benefit from video walls where a single projector would feel undersized or wash out under venue lighting. Samsung's VMB and VHC series provide the brightness and seamlessness needed for tiered seating venues where the back row still needs to read clearly.",
    useCases: [
      { title: "Auditorium Stage Backdrops", description: "Configurable backdrops for guest lectures, convocations, and cultural events — eliminate banner printing." },
      { title: "Convocation & Ceremony Halls", description: "Statement walls for degree ceremonies, founder's day, and accreditation events." },
      { title: "Sports Facility Scoreboards", description: "Live scoreboard, replay, and sponsor integration for indoor courts and pavilions." },
      { title: "Library Atriums", description: "Featured content, journal of the month, and event programming in shared study spaces." },
      { title: "Innovation Centre / Research Walls", description: "Live data dashboards showcasing ongoing research outputs to visiting funders." },
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
      "Samsung's interactive flat panels are the modern smart classroom standard — they replace the projector + whiteboard + connected PC trio with a single touch-driven device that runs Android-class apps, supports stylus and finger input simultaneously, and saves lesson notes automatically. Teachers stop wasting class time on tech setup.",
    useCases: [
      { title: "K-12 Classrooms", description: "65-75\" interactive displays for full-class teaching with split-screen for student work." },
      { title: "Higher Education Lecture Halls", description: "Large-format 86\" WAFX displays for engineering, medicine, and architecture programmes where detail matters." },
      { title: "Computer Labs & Practical Rooms", description: "Demonstration screens for teacher-led walkthroughs while students follow on their own machines." },
      { title: "Teacher Training Rooms", description: "Interactive professional development sessions with built-in screen recording and content archiving." },
      { title: "Special Education Resource Rooms", description: "Touch-driven accessible interfaces with adjustable height mounts for diverse learner needs." },
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
      "Residential schools, university hostels, and student common areas need TVs that survive shared use — power cycling, occasional abuse, and 14-hour days. Samsung's BE-series commercial TVs are the right tier: longer warranty, RS-232 control for central power scheduling, and locked-down menus that prevent students from changing inputs or installing random apps.",
    useCases: [
      { title: "Hostel Common Rooms", description: "Locked-channel TVs for shared viewing — sports, news, movies during designated hours." },
      { title: "Mess & Dining Hall Displays", description: "Menu boards, announcements, and ambient content during meal service." },
      { title: "Sports Lounge / Recreation Areas", description: "Larger 65-75\" TVs for sports viewing with central scheduling of on/off hours." },
      { title: "Reception & Visitor Lounges", description: "Branded content loops for parents and visitors waiting in reception." },
      { title: "Library Study Spaces", description: "Lower-brightness TVs for reference content and digital reading rooms." },
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
      "Retail digital signage is one of the highest-ROI applications of commercial displays — a single bright storefront display can drive a measurable footfall lift, and a digital menu board pays for itself in eliminated reprint costs within 12-18 months. We deploy Samsung QHC, QMC, QH115, and QPDX series across QSR chains, fashion retail, and shopping mall tenants.",
    useCases: [
      { title: "High-Brightness Storefront Displays", description: "QPDX semi-outdoor and QH115 ultra-high-brightness panels visible through windows even in direct sunlight." },
      { title: "QSR Menu Boards", description: "Day-parted menus that switch from breakfast to lunch to all-day; promotions auto-rotate." },
      { title: "Mall Atrium & Centre-Court Displays", description: "Statement displays for landlord-driven promotions and tenant adverts." },
      { title: "Shelf-Edge & End-Cap Promotions", description: "43-55\" displays at the shelf and aisle-end driving product awareness." },
      { title: "Fitting Room Wayfinding & Brand Content", description: "Customer-facing displays inside fitting rooms increase basket size through styling suggestions." },
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
      "Flagship retail and shopping centre atriums use video walls to create the moments that make a destination worth visiting. Samsung's VMB and VHC series deliver the seamlessness and brightness needed in lit retail environments where customers walk by within 1-2 metres — and notice every bezel and every reflection.",
    useCases: [
      { title: "Flagship Store Atrium Walls", description: "3-storey-high atrium walls for fashion, electronics, and automotive flagship destinations." },
      { title: "Brand Experience Zones", description: "Curved or angled wall configurations for immersive brand storytelling." },
      { title: "Mall Centre-Court Walls", description: "Anchor displays for centre-court events, holiday programming, and landlord ad sales." },
      { title: "Product Launch Environments", description: "Reconfigurable walls that brand for a launch this week and another next month." },
      { title: "Window Walls / Shop-Front Displays", description: "Multi-panel walls behind storefront glass for night-time visibility and brand presence." },
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
      "Retail interactive kiosks let stores show their full catalogue without holding stock in-store — customers browse, customize, and order on the kiosk; items ship to home or are reserved for a return visit. Samsung's WAC and WAD interactive panels are the standard tier for these deployments, with toughened glass and 50,000-hour touch ratings.",
    useCases: [
      { title: "Endless Aisle Browse", description: "Browse and order items not held in store stock — colour, size, and variant selection on a 55-65\" touch screen." },
      { title: "Self-Checkout / Express Lane", description: "Reduce queues at peak hours with self-service checkout for small-basket purchases." },
      { title: "Loyalty Sign-up & Personalisation", description: "Walk-up kiosks for loyalty enrolment, profile update, and personalised offer redemption." },
      { title: "Product Configurator (Made-to-Order)", description: "Furniture, jewellery, and made-to-order fashion configured visually on a large interactive canvas." },
      { title: "Wayfinding in Large Stores & Malls", description: "Touch-driven floor plans for big-box stores and multi-floor shopping centres." },
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
      "Retail back-of-house spaces — stockrooms, staff break areas, manager offices — need reliable TVs for shift briefings, training videos, and operations dashboards. Samsung's BE-series commercial TVs are the appropriate tier: business-warranted, with USB content playback and central scheduling built in.",
    useCases: [
      { title: "Stockroom & Operations Dashboards", description: "Live dashboards for inventory levels, shipment ETAs, and shift KPIs." },
      { title: "Staff Break Areas", description: "Brand content, training loops, and announcements during shift breaks." },
      { title: "Manager's Office & Back Office", description: "CCTV feed monitoring and operations TV for store managers." },
      { title: "Staff Training & Onboarding Rooms", description: "Reservable TVs for new-joiner training sessions and product launches." },
      { title: "Loading Bay & Receiving Areas", description: "Schedule and dock-status displays for inbound goods coordination." },
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
