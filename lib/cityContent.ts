import type { City, Region } from "@/data/cities";
import { SERVING_OFFICES } from "@/data/cities";
import { solutions, type Solution } from "@/data/solutions";

/**
 * Derived, city-varying copy for the /[city] landing pages.
 *
 * Lives in lib/ (not data/) for the same reason as lib/solutionProducts.ts:
 * data/ holds authored facts, lib/ derives presentation from them.
 *
 * HONESTY RULE for everything in this file: a city page may only assert what
 * the client-reviewed `intro` already asserts, plus facts that are true
 * nationwide (our catalog, our two real offices). Nothing here invents a local
 * presence, a lead time, or a customer.
 */

/** Human label for a region — used to vary logistics copy without inventing SLAs. */
const REGION_LABEL: Record<Region, string> = {
  north: "North India",
  south: "South India",
  east: "East & North-East India",
  west: "West India",
  central: "Central India",
};

/**
 * Sector keywords, keyed by solution slug.
 *
 * These read the client-reviewed `intro` — e.g. Jaipur's says "for its
 * hospitality, retail and corporate sectors". Matching on that text only
 * RESTATES an approved claim in a structured form; it never adds a new one.
 * A city whose intro names no sector (the generic "for businesses across X"
 * boilerplate) correctly yields an empty list, and callers fall back to
 * neutral copy rather than guessing.
 */
const SECTOR_PATTERNS: Record<string, RegExp> = {
  hospitality: /\b(hospitality|hotels?|resorts?|tourism)\b/i,
  retail: /\b(retail|showrooms?|malls?|stores?)\b/i,
  education: /\b(education|schools?|universit\w*|colleges?|campus\w*|coaching|institutes?)\b/i,
  corporate: /\b(corporate|offices?|industrial|industry|manufacturing|government|steel|towers?|enterprises?)\b/i,
};

/**
 * Solutions this city's reviewed intro actually names. Ordered by the canonical
 * `solutions` order so output is deterministic. Empty when the intro is generic.
 */
export function citySectors(city: City): Solution[] {
  return solutions.filter((s) => SECTOR_PATTERNS[s.slug]?.test(city.intro));
}

/** What a deployment in each sector typically involves — catalog facts, not city facts. */
const SECTOR_DEPLOYMENT: Record<string, string> = {
  hospitality: "guest-room TVs and lobby video walls",
  retail: "storefront signage and in-store promo screens",
  education: "interactive classroom panels and campus signage",
  corporate: "meeting-room displays and reception signage",
};

export interface ServeCard {
  title: string;
  body: string;
}

/**
 * The "How we serve {city}" cards. All three statements are true for every
 * city; the variation comes from the serving office, the region label and any
 * sector the intro named — never from invented local detail.
 */
export function cityServeCards(city: City): ServeCard[] {
  const office = SERVING_OFFICES[city.servedFrom];
  const sectors = citySectors(city);
  const region = REGION_LABEL[city.region];

  // Sector-flavoured installation copy, drawn from what the intro already says.
  const installFlavour = sectors.length
    ? ` Typical ${city.name} deployments cover ${sectors
        .slice(0, 3)
        .map((s) => SECTOR_DEPLOYMENT[s.slug])
        .filter(Boolean)
        .join(", ")}.`
    : "";

  return [
    {
      title: `Delivery to ${city.name}`,
      body: `Dispatched from our ${office.city} ${office.label} with GST invoicing and tracked logistics to ${city.name} and across ${city.state} — one of the ${region} markets we ship to directly.`,
    },
    {
      title: "Certified installation",
      body: `On-site mounting, alignment and MagicINFO/content setup for signage, video walls and interactive displays in ${city.name}.${installFlavour}`,
    },
    {
      title: "Service & AMC",
      body: `On-site service visits and Annual Maintenance Contracts for ${city.name} are coordinated from our ${office.city} ${office.label}, which covers our ${region} accounts.`,
    },
  ];
}

/** A sector-specific FAQ pair, phrased so the claim stays about our catalog. */
const SECTOR_FAQ: Record<string, { q: (c: string) => string; a: (c: string) => string }> = {
  hospitality: {
    q: (c) => `Do you supply hotel and guest-room TVs in ${c}?`,
    a: (c) =>
      `Yes. Our hospitality range — Samsung hospitality TVs for guest rooms, plus lobby video walls and digital concierge displays — is quoted and installed for ${c} properties.`,
  },
  retail: {
    q: (c) => `Do you supply retail signage and menu boards in ${c}?`,
    a: (c) =>
      `Yes. High-brightness window displays, in-store promotional screens and menu-board signage are all available for ${c} retail and F&B sites, with content setup included.`,
  },
  education: {
    q: (c) => `Do you supply interactive displays for schools and colleges in ${c}?`,
    a: (c) =>
      `Yes. Samsung interactive panels for classrooms and campus signage for corridors and halls are supplied and installed for ${c} institutions, with staff training on handover.`,
  },
  corporate: {
    q: (c) => `Do you supply meeting-room and boardroom displays in ${c}?`,
    a: (c) =>
      `Yes. Boardroom and huddle-room displays, interactive whiteboards and reception signage are specified, supplied and installed for ${c} offices.`,
  },
};

/**
 * Honest, city-named FAQ. Every answer is true for a Noida-HQ / Kolkata-branch
 * company that ships and services nationwide — no fabricated local office.
 *
 * Moved here from data/cities.ts so it can compose with citySectors(). The
 * middle of the list varies per city: cities whose reviewed intro names sectors
 * get up to two sector questions; generic cities get a catalog-breadth question
 * instead of an invented sector claim.
 */
export function cityFaqs(city: City): Array<{ q: string; a: string }> {
  const office = SERVING_OFFICES[city.servedFrom];
  const sectors = citySectors(city);

  const middle = sectors.length
    ? sectors.slice(0, 2).map((s) => ({
        q: SECTOR_FAQ[s.slug].q(city.name),
        a: SECTOR_FAQ[s.slug].a(city.name),
      }))
    : [
        {
          q: `What types of Samsung commercial displays can I buy in ${city.name}?`,
          a: `The full business range is available in ${city.name} — digital signage, video walls, interactive displays, LED signage and hospitality TVs — along with the mounts, media players and content software to run them.`,
        },
      ];

  return [
    {
      q: `Do you deliver Samsung commercial displays to ${city.name}?`,
      a: `Yes. As an authorized Samsung distributor we dispatch to ${city.name} and across ${city.state} from our ${office.city} ${office.label}, with GST invoicing and pan-India logistics.`,
    },
    {
      q: `Do you provide installation and setup in ${city.name}?`,
      a: `Yes. We coordinate certified on-site installation and commissioning for ${city.name} projects — including video-wall mounting, alignment and MagicINFO/content setup.`,
    },
    ...middle,
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
