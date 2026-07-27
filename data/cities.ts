export type Region = "north" | "south" | "east" | "west" | "central";

/**
 * One programmatic city landing page is generated per entry below.
 * URL: /{slug}  (root-level — the legacy 95 are the exact indexed URLs, preserved
 * so they keep working instead of 404ing after the migration; the net-new tier-2
 * cities added 2026-07-24 are additive growth pages with clean canonical slugs.)
 *
 * `servedFrom` encodes a real operational fact: eastern India is served from the
 * Kolkata regional office, the rest from the Noida HQ. It drives honest copy
 * about dispatch and on-site service — NOT a fabricated local presence.
 */
export interface City {
  /** For a legacy city this MUST equal the legacy URL segment exactly. */
  slug: string;
  name: string;
  state: string;
  region: Region;
  servedFrom: "noida" | "kolkata";
  /** 1–2 hand-written, city-specific sentences. Reviewed by the client (plan Task 8). */
  intro: string;
}

/** The two real Aplus locations. No third office exists — do not add city offices. */
export const SERVING_OFFICES: Record<
  "noida" | "kolkata",
  { city: string; label: string; addressRegion: string }
> = {
  noida: { city: "Noida", label: "headquarters", addressRegion: "Uttar Pradesh" },
  kolkata: { city: "Kolkata", label: "regional office", addressRegion: "West Bengal" },
};

export const cities: City[] = [
  // ── NORTH (served from Noida) ──────────────────────────────────────────────
  { slug: "delhi", name: "Delhi", state: "Delhi", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Delhi — from Connaught Place retail and Nehru Place IT offices to corporate campuses in Aerocity. As an authorized Samsung distributor operating from adjacent Noida, we deliver, install, and service the full signage, video-wall, interactive and hospitality-TV range across the capital." },
  { slug: "noida", name: "Noida", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Noida is home to the Aplus Technology Solutions headquarters, so businesses across Sectors 62, 63, 94 and the Expressway get the fastest access to our full Samsung commercial-display range — supply, certified installation, demos and AMC support, all coordinated locally." },
  { slug: "greater-noida", name: "Greater Noida", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Greater Noida — for its universities, manufacturing units and Knowledge Park offices — dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ghaziabad, Uttar Pradesh, dispatched and service-backed from our neighbouring Noida headquarters." },
  { slug: "faridabad", name: "Faridabad", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for offices, showrooms and industrial units across Faridabad, Haryana, dispatched and service-backed from our Noida headquarters." },
  { slug: "gurgaon", name: "Gurgaon", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Gurgaon (Gurugram) — for its Cyber City corporate towers, retail malls and hospitality venues — with delivery, certified installation and AMC coordinated from our Noida headquarters." },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and education clients across Chandigarh, dispatched and service-backed from our Noida headquarters." },
  { slug: "jammu", name: "Jammu", state: "Jammu & Kashmir", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses and institutions across Jammu, dispatched and service-backed from our Noida headquarters." },
  { slug: "srinagar", name: "Srinagar", state: "Jammu & Kashmir", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and government clients across Srinagar, dispatched and service-backed from our Noida headquarters." },
  { slug: "dehradun", name: "Dehradun", state: "Uttarakhand", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for schools, hotels and offices across Dehradun, Uttarakhand, dispatched and service-backed from our Noida headquarters." },
  { slug: "meerut", name: "Meerut", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Meerut, Uttar Pradesh, dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "agra", name: "Agra", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Agra, Uttar Pradesh — the full range of digital signage, video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "aligarh", name: "Aligarh", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for institutions and businesses across Aligarh, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "allahabad", name: "Prayagraj (Allahabad)", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Prayagraj (Allahabad)? Aplus Technology Solutions delivers smart signage, video walls, interactive panels and hotel TVs to organisations across Prayagraj (Allahabad) and the wider Uttar Pradesh region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "bareilly", name: "Bareilly", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Bareilly, Uttar Pradesh. We supply and install commercial signage, LED video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "firozabad", name: "Firozabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Firozabad businesses with Samsung digital signage, LED walls, touch-interactive displays and guest-room TVs — supply, certified installation and AMC across Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "gorakhpur", name: "Gorakhpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — digital signage, video walls, interactive displays and hospitality TVs — to Gorakhpur and the surrounding northern India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "jhansi", name: "Jhansi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Businesses across Jhansi, Uttar Pradesh source their Samsung commercial displays from Aplus Technology Solutions — smart signage, video walls, interactive panels and hotel TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kanpur, Uttar Pradesh — the full range of commercial signage, LED video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and retail clients across Lucknow, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "moradabad", name: "Moradabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Moradabad? Aplus Technology Solutions delivers digital signage, LED walls, touch-interactive displays and guest-room TVs to organisations across Moradabad and the wider Uttar Pradesh region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "saharanpur", name: "Saharanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Saharanpur, Uttar Pradesh. We supply and install digital signage, video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Varanasi businesses with Samsung smart signage, video walls, interactive panels and hotel TVs — supply, certified installation and AMC across Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "amritsar", name: "Amritsar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — commercial signage, LED video walls, interactive displays and hospitality TVs — to Amritsar and the surrounding northern India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "jalandhar", name: "Jalandhar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Businesses across Jalandhar, Punjab source their Samsung commercial displays from Aplus Technology Solutions — digital signage, LED walls, touch-interactive displays and guest-room TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "ludhiana", name: "Ludhiana", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ludhiana, Punjab — the full range of digital signage, video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "ajmer", name: "Ajmer", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Ajmer? Aplus Technology Solutions delivers smart signage, video walls, interactive panels and hotel TVs to organisations across Ajmer and the wider Rajasthan region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "bikaner", name: "Bikaner", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Bikaner, Rajasthan. We supply and install commercial signage, LED video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Jaipur, Rajasthan — for its hospitality, retail and corporate sectors — with delivery, certified installation and AMC coordinated from our Noida headquarters." },
  { slug: "jodhpur", name: "Jodhpur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Jodhpur businesses with Samsung digital signage, LED walls, touch-interactive displays and guest-room TVs — supply, certified installation and AMC across Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "kota", name: "Kota", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the coaching institutes, schools and offices of Kota, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "udaipur", name: "Udaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — digital signage, video walls, interactive displays and hospitality TVs — to Udaipur and the surrounding northern India market, dispatched and service-backed from our Noida headquarters." },
  // net-new tier-2 (added 2026-07-24)
  { slug: "panipat", name: "Panipat", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the textile industry, showrooms and offices of Panipat, Haryana, dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "ambala", name: "Ambala", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the scientific-instruments trade, cantonment institutions and businesses of Ambala, Haryana, dispatched and service-backed from our Noida headquarters." },
  { slug: "sonipat", name: "Sonipat", state: "Haryana", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the universities, industry and offices of Sonipat, Haryana, dispatched and service-backed from our nearby Noida headquarters." },
  { slug: "shimla", name: "Shimla", state: "Himachal Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the government, hospitality and education clients of Shimla, Himachal Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "mathura", name: "Mathura", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality and pilgrimage-tourism businesses of Mathura, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "haridwar", name: "Haridwar", state: "Uttarakhand", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the pharmaceutical, FMCG and industrial units of Haridwar, Uttarakhand, dispatched and service-backed from our Noida headquarters." },
  { slug: "mohali", name: "Mohali (SAS Nagar)", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the IT, pharmaceutical and corporate clients of Mohali (SAS Nagar), Punjab, dispatched and service-backed from our Noida headquarters." },

  // ── WEST (served from Noida) ───────────────────────────────────────────────
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Mumbai — from BKC corporate headquarters and Nariman Point offices to retail flagships and five-star hospitality. As an authorized Samsung distributor, we deliver, install and service the full signage, video-wall, interactive and hospitality-TV range citywide." },
  { slug: "navi-mumbai", name: "Navi Mumbai", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Navi Mumbai — for its Vashi and Airoli IT parks, retail and education clients — with certified installation and AMC support." },
  { slug: "thane", name: "Thane", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for offices, malls and institutions across Thane, Maharashtra, with certified installation and AMC support." },
  { slug: "pune", name: "Pune", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Pune — for its Hinjewadi IT campuses, automotive industry, education hubs and retail — delivering the full Samsung B2B display range with certified installation and AMC support." },
  { slug: "pimpri-and-chinchwad", name: "Pimpri-Chinchwad", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the manufacturing and corporate clients of Pimpri-Chinchwad, Maharashtra, with certified installation and AMC support." },
  { slug: "nashik", name: "Nashik", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Businesses across Nashik, Maharashtra source their Samsung commercial displays from Aplus Technology Solutions — smart signage, video walls, interactive panels and hotel TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nagpur, Maharashtra — the full range of commercial signage, LED video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "aurangabad", name: "Aurangabad (Chhatrapati Sambhajinagar)", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Aurangabad (Chhatrapati Sambhajinagar)? Aplus Technology Solutions delivers digital signage, LED walls, touch-interactive displays and guest-room TVs to organisations across Aurangabad (Chhatrapati Sambhajinagar) and the wider Maharashtra region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "amravati", name: "Amravati", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Amravati, Maharashtra. We supply and install digital signage, video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "solapur", name: "Solapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Solapur businesses with Samsung smart signage, video walls, interactive panels and hotel TVs — supply, certified installation and AMC across Maharashtra, dispatched and service-backed from our Noida headquarters." },
  { slug: "kolapur", name: "Kolhapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — commercial signage, LED video walls, interactive displays and hospitality TVs — to Kolhapur and the surrounding western India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "sangli", name: "Sangli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Businesses across Sangli, Maharashtra source their Samsung commercial displays from Aplus Technology Solutions — digital signage, LED walls, touch-interactive displays and guest-room TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "jalgaon", name: "Jalgaon", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jalgaon, Maharashtra — the full range of digital signage, video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "nanded-waghala", name: "Nanded-Waghala", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Nanded-Waghala? Aplus Technology Solutions delivers smart signage, video walls, interactive panels and hotel TVs to organisations across Nanded-Waghala and the wider Maharashtra region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "bhiwandi", name: "Bhiwandi", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the warehousing and retail businesses of Bhiwandi, Maharashtra, with certified installation and AMC support." },
  { slug: "kalyan", name: "Kalyan-Dombivli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Kalyan-Dombivli, Maharashtra. We supply and install commercial signage, LED video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "ulhasnagar", name: "Ulhasnagar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Ulhasnagar businesses with Samsung digital signage, LED walls, touch-interactive displays and guest-room TVs — supply, certified installation and AMC across Maharashtra, dispatched and service-backed from our Noida headquarters." },
  { slug: "mira-and-bhayander", name: "Mira-Bhayandar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — digital signage, video walls, interactive displays and hospitality TVs — to Mira-Bhayandar and the surrounding western India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Ahmedabad — for its corporate offices, textile and retail businesses and education institutions — delivering the full Samsung B2B range with certified installation and AMC support." },
  { slug: "surat", name: "Surat", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the diamond, textile and retail businesses of Surat, Gujarat, with certified installation and AMC support." },
  { slug: "vadodara", name: "Vadodara", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate and industrial clients across Vadodara, Gujarat, with certified installation and AMC support." },
  { slug: "rajkot", name: "Rajkot", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Businesses across Rajkot, Gujarat source their Samsung commercial displays from Aplus Technology Solutions — smart signage, video walls, interactive panels and hotel TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "bhavnagar", name: "Bhavnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bhavnagar, Gujarat — the full range of commercial signage, LED video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "jamnagar", name: "Jamnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Jamnagar? Aplus Technology Solutions delivers digital signage, LED walls, touch-interactive displays and guest-room TVs to organisations across Jamnagar and the wider Gujarat region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  // net-new tier-2 (added 2026-07-24)
  { slug: "gandhinagar", name: "Gandhinagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the government offices, GIFT City corporates and education institutions of Gandhinagar, Gujarat, with certified installation and AMC support." },
  { slug: "anand", name: "Anand", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the dairy, education and business clients of Anand, Gujarat, with certified installation and AMC support." },
  { slug: "vapi", name: "Vapi", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the chemical and manufacturing industries of the Vapi industrial belt, Gujarat, with certified installation and AMC support." },
  { slug: "panaji", name: "Panaji (Goa)", state: "Goa", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality, tourism and retail businesses of Panaji and across Goa, with certified installation and AMC support." },

  // ── CENTRAL (served from Noida) ────────────────────────────────────────────
  { slug: "bhopal", name: "Bhopal", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and education clients across Bhopal, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Indore — Madhya Pradesh's commercial hub — for its retail, corporate and education sectors, with certified installation and AMC support." },
  { slug: "gwalior", name: "Gwalior", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Gwalior, Madhya Pradesh. We supply and install digital signage, video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Jabalpur businesses with Samsung smart signage, video walls, interactive panels and hotel TVs — supply, certified installation and AMC across Madhya Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "ujjain", name: "Ujjain", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — commercial signage, LED video walls, interactive displays and hospitality TVs — to Ujjain and the surrounding central India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "raipur", name: "Raipur", state: "Chhattisgarh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate and government clients across Raipur, Chhattisgarh, with certified installation and AMC support." },
  { slug: "bhilai-nagar", name: "Bhilai", state: "Chhattisgarh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Bhilai, Chhattisgarh, with certified installation and AMC support." },
  // net-new tier-2 (added 2026-07-24)
  { slug: "bilaspur", name: "Bilaspur", state: "Chhattisgarh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the government, railway-zone and commercial clients of Bilaspur, Chhattisgarh, with certified installation and AMC support." },

  // ── SOUTH (served from Noida) ──────────────────────────────────────────────
  { slug: "bangalore", name: "Bengaluru", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Bengaluru — from Whitefield and ORR tech campuses to retail, hospitality and education — delivering the full Samsung B2B signage, video-wall and interactive range with certified installation and AMC support." },
  { slug: "chennai", name: "Chennai", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Chennai — for its IT corridor offices, manufacturing, retail and hospitality clients — with certified installation and AMC support statewide." },
  { slug: "ambattur", name: "Ambattur", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial estate and businesses of Ambattur, Chennai, with certified installation and AMC support." },
  { slug: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, education and retail clients across Coimbatore, Tamil Nadu, with certified installation and AMC support." },
  { slug: "madurai", name: "Madurai", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Businesses across Madurai, Tamil Nadu source their Samsung commercial displays from Aplus Technology Solutions — digital signage, LED walls, touch-interactive displays and guest-room TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "salem", name: "Salem", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Salem, Tamil Nadu — the full range of digital signage, video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "tiruchirappalli", name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Tiruchirappalli (Trichy)? Aplus Technology Solutions delivers smart signage, video walls, interactive panels and hotel TVs to organisations across Tiruchirappalli (Trichy) and the wider Tamil Nadu region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Hyderabad — from HITEC City corporate campuses to retail, hospitality and government — delivering the full Samsung B2B display range with certified installation and AMC support." },
  { slug: "warangal", name: "Warangal", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Warangal, Telangana. We supply and install commercial signage, LED video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, dispatched and service-backed from our Noida headquarters." },
  { slug: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Vijayawada businesses with Samsung digital signage, LED walls, touch-interactive displays and guest-room TVs — supply, certified installation and AMC across Andhra Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, industrial and corporate clients of Visakhapatnam, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "guntur", name: "Guntur", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — digital signage, video walls, interactive displays and hospitality TVs — to Guntur and the surrounding southern India market, dispatched and service-backed from our Noida headquarters." },
  { slug: "nellore", name: "Nellore", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Businesses across Nellore, Andhra Pradesh source their Samsung commercial displays from Aplus Technology Solutions — smart signage, video walls, interactive panels and hotel TVs, with delivery, certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "belgaum", name: "Belagavi (Belgaum)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Belagavi (Belgaum), Karnataka — the full range of commercial signage, LED video walls, interactive displays and hospitality TVs — dispatched and service-backed from our Noida headquarters." },
  { slug: "gulbarga", name: "Kalaburagi (Gulbarga)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Looking for Samsung commercial displays in Kalaburagi (Gulbarga)? Aplus Technology Solutions delivers digital signage, LED walls, touch-interactive displays and guest-room TVs to organisations across Kalaburagi (Gulbarga) and the wider Karnataka region, with certified installation and AMC dispatched and service-backed from our Noida headquarters." },
  { slug: "mangalore", name: "Mangaluru (Mangalore)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, education and retail clients of Mangaluru (Mangalore), Karnataka, with certified installation and AMC support." },
  { slug: "kochi", name: "Kochi", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the IT, hospitality and retail clients of Kochi, Kerala, with certified installation and AMC support." },
  { slug: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, IT and education clients across Thiruvananthapuram, Kerala, with certified installation and AMC support." },
  // net-new tier-2 (added 2026-07-24)
  { slug: "mysuru", name: "Mysuru (Mysore)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the IT, heritage-tourism hospitality and education clients of Mysuru (Mysore), Karnataka, with certified installation and AMC support." },
  { slug: "hubli-dharwad", name: "Hubballi-Dharwad", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the businesses, education and government clients of Hubballi-Dharwad — the commercial hub of North Karnataka — with certified installation and AMC support." },
  { slug: "kozhikode", name: "Kozhikode (Calicut)", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the trade, retail and hospitality businesses of Kozhikode (Calicut), Kerala, with certified installation and AMC support." },
  { slug: "thrissur", name: "Thrissur", state: "Kerala", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the banking, gold-trade and retail businesses of Thrissur, Kerala, with certified installation and AMC support." },
  { slug: "vellore", name: "Vellore", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the education and healthcare institutions of Vellore, Tamil Nadu, with certified installation and AMC support." },
  { slug: "tirupati", name: "Tirupati", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality, education and institutional clients of Tirupati, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "puducherry", name: "Puducherry", state: "Puducherry", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality, education and industrial clients of Puducherry, with certified installation and AMC support." },
  { slug: "tiruppur", name: "Tiruppur", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the knitwear-export and textile businesses of Tiruppur, Tamil Nadu, with certified installation and AMC support." },
  { slug: "tuticorin", name: "Thoothukudi (Tuticorin)", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, industrial and trading businesses of Thoothukudi (Tuticorin), Tamil Nadu, with certified installation and AMC support." },

  // ── EAST (served from Kolkata) ─────────────────────────────────────────────
  { slug: "kolkata", name: "Kolkata", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions serves Kolkata directly from our regional office in the city — supplying, installing and servicing the full Samsung commercial-display range for corporate, retail, hospitality and education clients across greater Kolkata with the fastest turnaround in eastern India." },
  { slug: "haora", name: "Howrah", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Howrah, West Bengal, served directly from our nearby Kolkata regional office with fast delivery, certified installation and AMC support." },
  { slug: "maheshtala", name: "Maheshtala", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions is an authorized Samsung distributor serving Maheshtala, West Bengal. We supply and install digital signage, video walls, interactive displays and hospitality TVs for offices, retail and institutions across the city, served from our Kolkata regional office." },
  { slug: "asansol", name: "Asansol", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "From single displays to full projects, Aplus Technology Solutions equips Asansol businesses with Samsung smart signage, video walls, interactive panels and hotel TVs — supply, certified installation and AMC across West Bengal, served from our Kolkata regional office." },
  { slug: "durgapur", name: "Durgapur", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions brings the complete Samsung commercial-display range — commercial signage, LED video walls, interactive displays and hospitality TVs — to Durgapur and the surrounding eastern India market, served from our Kolkata regional office." },
  { slug: "siliguri", name: "Siliguri", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Businesses across Siliguri, West Bengal source their Samsung commercial displays from Aplus Technology Solutions — digital signage, LED walls, touch-interactive displays and guest-room TVs, with delivery, certified installation and AMC served from our Kolkata regional office." },
  { slug: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, IT and education clients across Bhubaneswar, Odisha, served from our Kolkata regional office." },
  { slug: "cuttack", name: "Cuttack", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Cuttack, Odisha — the full range of digital signage, video walls, interactive displays and hospitality TVs — served from our Kolkata regional office." },
  { slug: "guwahati", name: "Guwahati", state: "Assam", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Guwahati, Assam — the gateway to the North-East — served from our Kolkata regional office." },
  { slug: "patna", name: "Patna", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, education and retail clients across Patna, Bihar, served from our Kolkata regional office." },
  { slug: "gaya", name: "Gaya", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality and institutional clients of Gaya, Bihar, served from our Kolkata regional office." },
  { slug: "ranchi", name: "Ranchi", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and education clients across Ranchi, Jharkhand, served from our Kolkata regional office." },
  { slug: "dhanbad", name: "Dhanbad", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Looking for Samsung commercial displays in Dhanbad? Aplus Technology Solutions delivers smart signage, video walls, interactive panels and hotel TVs to organisations across Dhanbad and the wider Jharkhand region, with certified installation and AMC served from our Kolkata regional office." },
  { slug: "jamshedpur", name: "Jamshedpur", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the corporate and industrial clients of Jamshedpur, Jharkhand, served from our Kolkata regional office." },
  // net-new tier-2 (added 2026-07-24)
  { slug: "rourkela", name: "Rourkela", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the steel, industrial and institutional clients of Rourkela, Odisha, served from our Kolkata regional office." },
  { slug: "bokaro", name: "Bokaro Steel City", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the steel and industrial clients of Bokaro Steel City, Jharkhand, served from our Kolkata regional office." },
  { slug: "shillong", name: "Shillong", state: "Meghalaya", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the government, education and tourism clients of Shillong, Meghalaya, served from our Kolkata regional office." },
  { slug: "dibrugarh", name: "Dibrugarh", state: "Assam", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the tea, oil & gas and education clients of Dibrugarh, Assam, served from our Kolkata regional office." },
];

/** Set of city slugs — used by middleware and tests. */
export const CITY_SLUGS: ReadonlySet<string> = new Set(cities.map((c) => c.slug));

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

/**
 * The "We also serve" internal-link set for a city page.
 *
 * Walks the city's own region as a RING — the `limit` entries following this
 * city, wrapping at the end — instead of taking the first `limit` of the region.
 * The old `.filter(region).slice(0, limit)` pointed every city in a region at
 * the same six entries, so those six absorbed every inbound link in the region
 * and the remaining ~110 city pages were left orphaned (reachable only from
 * /locations). A ring gives every city exactly `limit` outbound AND exactly
 * `limit` inbound links.
 *
 * Relevance comes for free: `cities` is authored grouped by region and then by
 * state, so a city's ring neighbours are overwhelmingly its own state's cities.
 * Ordering is positional, so the result stays deterministic across builds.
 */
export function relatedCities(city: City, limit = 6): City[] {
  const peers = cities.filter((c) => c.region === city.region);
  const self = peers.findIndex((c) => c.slug === city.slug);
  if (self === -1) return [];

  const out: City[] = [];
  for (let step = 1; step <= limit && step < peers.length; step++) {
    out.push(peers[(self + step) % peers.length]);
  }
  return out;
}

// NOTE: cityFaqs() moved to lib/cityContent.ts, where it can compose with
// citySectors(). data/ holds authored facts; lib/ derives copy from them.
