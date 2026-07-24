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
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and education clients across Agra, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "aligarh", name: "Aligarh", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for institutions and businesses across Aligarh, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "allahabad", name: "Prayagraj (Allahabad)", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Prayagraj (Allahabad), Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "bareilly", name: "Bareilly", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bareilly, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "firozabad", name: "Firozabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Firozabad, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "gorakhpur", name: "Gorakhpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Gorakhpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "jhansi", name: "Jhansi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jhansi, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, retail and offices across Kanpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and retail clients across Lucknow, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "moradabad", name: "Moradabad", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Moradabad, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "saharanpur", name: "Saharanpur", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Saharanpur, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality, retail and education clients across Varanasi, Uttar Pradesh, dispatched and service-backed from our Noida headquarters." },
  { slug: "amritsar", name: "Amritsar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Amritsar, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "jalandhar", name: "Jalandhar", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jalandhar, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "ludhiana", name: "Ludhiana", state: "Punjab", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for industry, retail and offices across Ludhiana, Punjab, dispatched and service-backed from our Noida headquarters." },
  { slug: "ajmer", name: "Ajmer", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ajmer, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "bikaner", name: "Bikaner", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bikaner, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Jaipur, Rajasthan — for its hospitality, retail and corporate sectors — with delivery, certified installation and AMC coordinated from our Noida headquarters." },
  { slug: "jodhpur", name: "Jodhpur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Jodhpur, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "kota", name: "Kota", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the coaching institutes, schools and offices of Kota, Rajasthan, dispatched and service-backed from our Noida headquarters." },
  { slug: "udaipur", name: "Udaipur", state: "Rajasthan", region: "north", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for hospitality and retail clients across Udaipur, Rajasthan, dispatched and service-backed from our Noida headquarters." },
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
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nashik, Maharashtra, with certified installation and AMC support." },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Nagpur, Maharashtra, with certified installation and AMC support." },
  { slug: "aurangabad", name: "Aurangabad (Chhatrapati Sambhajinagar)", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Aurangabad (Chhatrapati Sambhajinagar), Maharashtra, with certified installation and AMC support." },
  { slug: "amravati", name: "Amravati", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Amravati, Maharashtra, with certified installation and AMC support." },
  { slug: "solapur", name: "Solapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Solapur, Maharashtra, with certified installation and AMC support." },
  { slug: "kolapur", name: "Kolhapur", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kolhapur, Maharashtra, with certified installation and AMC support." },
  { slug: "sangli", name: "Sangli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Sangli, Maharashtra, with certified installation and AMC support." },
  { slug: "jalgaon", name: "Jalgaon", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jalgaon, Maharashtra, with certified installation and AMC support." },
  { slug: "nanded-waghala", name: "Nanded-Waghala", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nanded-Waghala, Maharashtra, with certified installation and AMC support." },
  { slug: "bhiwandi", name: "Bhiwandi", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the warehousing and retail businesses of Bhiwandi, Maharashtra, with certified installation and AMC support." },
  { slug: "kalyan", name: "Kalyan-Dombivli", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kalyan-Dombivli, Maharashtra, with certified installation and AMC support." },
  { slug: "ulhasnagar", name: "Ulhasnagar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ulhasnagar, Maharashtra, with certified installation and AMC support." },
  { slug: "mira-and-bhayander", name: "Mira-Bhayandar", state: "Maharashtra", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Mira-Bhayandar, Maharashtra, with certified installation and AMC support." },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Ahmedabad — for its corporate offices, textile and retail businesses and education institutions — delivering the full Samsung B2B range with certified installation and AMC support." },
  { slug: "surat", name: "Surat", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the diamond, textile and retail businesses of Surat, Gujarat, with certified installation and AMC support." },
  { slug: "vadodara", name: "Vadodara", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate and industrial clients across Vadodara, Gujarat, with certified installation and AMC support." },
  { slug: "rajkot", name: "Rajkot", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Rajkot, Gujarat, with certified installation and AMC support." },
  { slug: "bhavnagar", name: "Bhavnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Bhavnagar, Gujarat, with certified installation and AMC support." },
  { slug: "jamnagar", name: "Jamnagar", state: "Gujarat", region: "west", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jamnagar, Gujarat, with certified installation and AMC support." },
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
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Gwalior, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "jabalpur", name: "Jabalpur", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Jabalpur, Madhya Pradesh, with certified installation and AMC support." },
  { slug: "ujjain", name: "Ujjain", state: "Madhya Pradesh", region: "central", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Ujjain, Madhya Pradesh, with certified installation and AMC support." },
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
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Madurai, Tamil Nadu, with certified installation and AMC support." },
  { slug: "salem", name: "Salem", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Salem, Tamil Nadu, with certified installation and AMC support." },
  { slug: "tiruchirappalli", name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Tiruchirappalli (Trichy), Tamil Nadu, with certified installation and AMC support." },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays across Hyderabad — from HITEC City corporate campuses to retail, hospitality and government — delivering the full Samsung B2B display range with certified installation and AMC support." },
  { slug: "warangal", name: "Warangal", state: "Telangana", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Warangal, Telangana, with certified installation and AMC support." },
  { slug: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Vijayawada, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the port, industrial and corporate clients of Visakhapatnam, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "guntur", name: "Guntur", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Guntur, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "nellore", name: "Nellore", state: "Andhra Pradesh", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Nellore, Andhra Pradesh, with certified installation and AMC support." },
  { slug: "belgaum", name: "Belagavi (Belgaum)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Belagavi (Belgaum), Karnataka, with certified installation and AMC support." },
  { slug: "gulbarga", name: "Kalaburagi (Gulbarga)", state: "Karnataka", region: "south", servedFrom: "noida",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Kalaburagi (Gulbarga), Karnataka, with certified installation and AMC support." },
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
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Maheshtala, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "asansol", name: "Asansol", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Asansol, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "durgapur", name: "Durgapur", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Durgapur, West Bengal, served from our Kolkata regional office." },
  { slug: "siliguri", name: "Siliguri", state: "West Bengal", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Siliguri, West Bengal, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, IT and education clients across Bhubaneswar, Odisha, served from our Kolkata regional office." },
  { slug: "cuttack", name: "Cuttack", state: "Odisha", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for businesses across Cuttack, Odisha, served from our Kolkata regional office with certified installation and AMC support." },
  { slug: "guwahati", name: "Guwahati", state: "Assam", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for corporate, retail and government clients across Guwahati, Assam — the gateway to the North-East — served from our Kolkata regional office." },
  { slug: "patna", name: "Patna", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, education and retail clients across Patna, Bihar, served from our Kolkata regional office." },
  { slug: "gaya", name: "Gaya", state: "Bihar", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the hospitality and institutional clients of Gaya, Bihar, served from our Kolkata regional office." },
  { slug: "ranchi", name: "Ranchi", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for government, corporate and education clients across Ranchi, Jharkhand, served from our Kolkata regional office." },
  { slug: "dhanbad", name: "Dhanbad", state: "Jharkhand", region: "east", servedFrom: "kolkata",
    intro: "Aplus Technology Solutions supplies and installs Samsung commercial displays for the industrial and institutional clients of Dhanbad, Jharkhand, served from our Kolkata regional office." },
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
 * Honest, city-named FAQ. Every answer is true for a Noida-HQ / Kolkata-branch
 * company that ships and services nationwide — no fabricated local office.
 */
export function cityFaqs(city: City): Array<{ q: string; a: string }> {
  const office = SERVING_OFFICES[city.servedFrom];
  return [
    {
      q: `Do you deliver Samsung commercial displays to ${city.name}?`,
      a: `Yes. As an authorized Samsung distributor we dispatch to ${city.name} and across ${city.state} from our ${office.city} ${office.label}, with GST invoicing and pan-India logistics.`,
    },
    {
      q: `Do you provide installation and setup in ${city.name}?`,
      a: `Yes. We coordinate certified on-site installation and commissioning for ${city.name} projects — including video-wall mounting, alignment and MagicINFO/content setup.`,
    },
    {
      q: `Is service and AMC support available in ${city.name}?`,
      a: `Yes. On-site service and Annual Maintenance Contracts for ${city.name} are coordinated from our ${office.city} ${office.label} so your displays stay covered after installation.`,
    },
    {
      q: `Can a ${city.name} business get bulk or project pricing?`,
      a: `Yes. We quote B2B and project volumes with GST invoicing. Request a quote or call us and we'll price your ${city.name} requirement.`,
    },
  ];
}
