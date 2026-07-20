# Class Saathi Education Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-19-class-saathi-education-design.md` (approved)

**Goal:** Add an `education` category whose category page is a premium Class Saathi
(TagHive) landing that generates school leads, delivered to `CLASS_SAATHI_TO_EMAIL`
and segmented in Zoho as `Lead_Source: "Class Saathi"`.

**Architecture:** New taxonomy entry + early branch in `app/categories/[slug]/page.tsx`
to `<EducationLanding />` (education has zero catalog products). All copy lives in
`data/education.ts`. Lead form POSTs to the existing `/api/contact` pipeline with an
education-specific email template and env-driven delivery address. Product-listing
surfaces get a generic "zero products ⇒ no chip" guard.

**Tech Stack:** Next 16 App Router, Tailwind v4, framer-motion (installed),
react-hook-form + zod (installed), Resend, Zoho CRM, PostHog, Vitest.

## Global Constraints

- **Content truth policy:** every claim traces to `Class_Saathi.pdf`
  (`C:\Users\samee\Downloads\Class_Saathi.pdf`) or TagHive's public site verified
  during implementation. No testimonials, no "+12% grades", no "500k clickers /
  5,000 schools / 5M questions", no CS-25/CS-40/CS-80 SKUs, no battery/curriculum
  specifics unless verified.
- **Zero partnership language:** the strings `authorized`, `authorised`, `official`,
  `certified`, `partner` must not appear on any education surface (copy, metadata,
  JSON-LD). The word `Samsung` may appear **only** inside the phrase
  `Samsung C-Lab` (factual attribution, brochure p.1/p.10). Enforced by test.
- **Chip wording note (spec deviation):** spec drafted "By TagHive — a Samsung C-Lab
  spin-off"; the brochure's verifiable wording is "Accelerated by Samsung C-Lab".
  Use *"By TagHive · accelerated by Samsung C-Lab"* (stricter-truthful).
- `CLASS_SAATHI_TO_EMAIL` is read from env only — **never hardcode**
  `sunil@aplustechsol.com` in code. Fallback is the existing `TO_EMAIL`.
- Slug is `education` (CategorySlug). `dynamicParams = false` and
  `generateStaticParams` stay unchanged (education joins the enumerated set).
- Home 2×4 grid untouched. No middleware redirects. No catalog products.
- Never import `next/font` from a `"use client"` file (project memory).
- Icons: lucide-react for chrome, per site convention. Animations: existing
  `AnimatedSection` wrapper or framer-motion (already installed).
- Presentational JSX in Tasks 5–11 is the functional baseline — apply
  `frontend-design` skill polish in place. Class names may evolve; the **content
  bindings, ids, and component contracts must not**.
- Commit after every task. Branch: stay on `feat/logitech-video-conferencing`
  (the spec commit c14fb73 and the catalog-expansion train live here).

---

### Task 0: Commit the in-flight apiErrors refactor

The working tree already carries an unrelated, complete refactor (new
`lib/apiErrors.ts`; `app/api/contact/route.ts`, `app/api/chat/escalate/route.ts`,
`app/api/chat/reply-email/route.ts` now use `getResend()`/`serverError()`).
Committing it first keeps education commits clean.

**Files:** commit only — no edits.

- [ ] **Step 0.1:** Run `npm test` — expect all suites green (baseline).
- [ ] **Step 0.2:** Run `npx tsc --noEmit` — expect no errors.
- [ ] **Step 0.3:** Commit:

```bash
git add lib/apiErrors.ts app/api/contact/route.ts app/api/chat/escalate/route.ts app/api/chat/reply-email/route.ts
git commit -m "refactor(api): centralize Resend construction and 500 handling in lib/apiErrors"
```

---

### Task 1: `data/education.ts` + truth-policy tests

**Files:**
- Create: `data/education.ts`
- Test: `data/education.test.ts`

**Interfaces (Produces — later tasks import these exact names):**

```ts
educationAwards: EducationAward[]            // { title, issuer, year }
educationHero: { eyebrow, headline, headlineAccent, sub, chips: string[] }
participationComparison: { before: ComparisonPanel; after: ComparisonPanel }
                                             // ComparisonPanel = { title, stat, statLabel, points: string[] }
howItWorksSteps: { title: string; detail: string }[]   // exactly 4
ecosystemTabs: EcosystemTab[]                // { id, label, headline, blurb, features: {title, detail}[], image, imageAlt }
simulatorQuestions: SimQuestion[]            // { id, subject, question, options: Record<"A"|"B"|"C"|"D",string>, correct, explanation, classAnswers: Record<"A"|"B"|"C"|"D",number> }
educationFaqs: { q: string; a: string }[]    // exactly 6
leadFormOptions: { studentCounts: string[]; goals: string[] }
educationClosing: { headline: string; sub: string; trademark: string }
```

- [ ] **Step 1.1: Write `data/education.ts`** with this content (verbatim — copy is
  the deliverable; every fact annotated to its brochure page):

```ts
/**
 * Class Saathi (TagHive) education landing content.
 *
 * CONTENT TRUTH POLICY: every claim below traces to the Class Saathi brochure
 * (Class_Saathi.pdf, page refs in comments) or TagHive's public site. No
 * partnership language anywhere — Aplus is an independent solutions provider
 * featuring Class Saathi. "Samsung" may appear only as "Samsung C-Lab"
 * (factual attribution). Enforced by data/education.test.ts.
 */

export interface EducationAward {
  title: string;
  issuer: string;
  year: string;
}

export interface ComparisonPanel {
  title: string;
  stat: string;
  statLabel: string;
  points: string[];
}

export interface EcosystemTab {
  id: "teacher" | "student" | "parent" | "admin";
  label: string;
  headline: string;
  blurb: string;
  features: { title: string; detail: string }[];
  image: string;
  imageAlt: string;
}

export type SimOption = "A" | "B" | "C" | "D";

export interface SimQuestion {
  id: number;
  subject: "Math" | "Science" | "Class Saathi";
  question: string;
  options: Record<SimOption, string>;
  correct: SimOption;
  explanation: string;
  /** Simulated responses from the rest of the class (excludes the visitor). */
  classAnswers: Record<SimOption, number>;
}

export const educationHero = {
  eyebrow: "Education · Class Saathi® by TagHive",
  headline: "Every voice heard.",
  headlineAccent: "Every learner engaged.",
  // Brochure p.2: world-first Bluetooth clicker + AI powered learning platform;
  // p.3: no internet required.
  sub: "Class Saathi pairs simple Bluetooth clickers with an AI-powered learning and assessment platform, so every student answers every question — with no internet required in class. Aplus Technology Solutions helps schools across India see it live and roll it out.",
  chips: [
    "No internet required", // p.3
    "100% student participation", // p.3
    "By TagHive · accelerated by Samsung C-Lab", // p.1, p.10
  ],
};

// Brochure p.10 — awards grid (8 of 9; EdTech Tulna rating omitted per spec).
export const educationAwards: EducationAward[] = [
  { title: "Top 10 EdTech Startup", issuer: "UNICEF XTC Competition", year: "2022" },
  { title: "EdTech & Learning Evolution — Bronze", issuer: "Edison Awards", year: "2025" },
  { title: "Top 1% — Global Learning Challenge", issuer: "MIT Solve", year: "2025" },
  { title: "Best EdTech Product — Hardware", issuer: "Global EdTech Awards", year: "2024" },
  { title: "Excellence in the Use of AI in Education", issuer: "Financial Express", year: "2025" },
  { title: "Best Assessment Solution Provider", issuer: "GLE Awards", year: "2023" },
  { title: "Best Classroom Solution of the Year", issuer: "Indian Education Awards", year: "2024" },
  { title: "Education Startup of the Year", issuer: "DIDAC India", year: "2019" },
];

// Brochure p.3 — 40% → 100% participation graphic; "Records student responses
// instantly", "Saves time", "Reduces workload", "No internet required".
export const participationComparison = {
  before: {
    title: "Before Class Saathi",
    stat: "40%",
    statLabel: "of students participate",
    points: [
      "A few confident students answer; the rest stay silent",
      "Teachers can't see who is lost until test day",
      "Checking every student's understanding by hand takes time",
    ],
  },
  after: {
    title: "After Class Saathi",
    stat: "100%",
    statLabel: "student participation",
    points: [
      "Every student answers every question on their own clicker",
      "Responses are recorded instantly, question by question",
      "Saves time and reduces teacher workload",
    ],
  },
} satisfies { before: ComparisonPanel; after: ComparisonPanel };

// Brochure p.9 — "How Teachers Use Class Saathi in Class".
export const howItWorksSteps = [
  {
    title: "Class preparation",
    detail: "Teachers pick ready-made quizzes — or generate their own — in the Class Saathi app.",
  },
  {
    title: "Students answer with clickers",
    detail: "Each student responds on their own Bluetooth clicker and every answer is captured instantly.",
  },
  {
    title: "Data tracking",
    detail: "Student responses are saved automatically for review and analysis.",
  },
  {
    title: "AI-powered reports",
    detail: "Personalised Saathi AI insights are available for every student and the whole class.",
  },
];

// Brochure pp.4–8. Image paths land in Task 4.
export const ecosystemTabs: EcosystemTab[] = [
  {
    id: "teacher",
    label: "Teacher",
    headline: "Run engaging, data-rich lessons",
    blurb: "Seamless engagement and performance tracking — with Saathi AI doing the heavy lifting.", // p.4, p.5
    features: [
      { title: "AI quiz generation", detail: "Generate quizzes from learning-related URLs, documents or prompts." }, // p.5
      { title: "Smart AI lesson plans", detail: "Create and customise AI-based lesson plans aligned with your own documents." }, // p.5
      { title: "AI-based insights", detail: "Download reports for each student and for the entire class." }, // p.5
      { title: "Class kit tools", detail: "Pie timer, stopwatch, spinner, dice, team maker, presenter and vote — built in." }, // p.6
    ],
    image: "/education/class-saathi/teacher-ai-quiz.webp",
    imageAlt: "Saathi AI quiz generation screen — create quizzes from web URLs, documents or prompts",
  },
  {
    id: "student",
    label: "Student",
    headline: "Self-learning that feels like play",
    blurb: "Personalised learning, anytime and anywhere.", // p.4, p.7
    features: [
      { title: "Saathi Tutor", detail: "Master concepts with a personalised AI tutor." }, // p.7
      { title: "Daily quizzes", detail: "Organise your learning and challenge yourself every day." }, // p.7
      { title: "Subject-centric quizzes", detail: "Master every subject with unlimited practice quizzes." }, // p.7
      { title: "Personalised assignments", detail: "Solve assignments designed for each learner." }, // p.7
    ],
    image: "/education/class-saathi/student-app.webp",
    imageAlt: "Class Saathi student app — daily quests, subject quizzes and Saathi Tutor",
  },
  {
    id: "parent",
    label: "Parent",
    headline: "See progress, support learning at home",
    blurb: "Student progress and learning supervision from the parent app.", // p.4, p.8
    features: [
      { title: "Progress tracking", detail: "Track performance and celebrate progress as it happens." }, // p.8
      { title: "Today's quiz sets", detail: "Review the day's quiz sets together with your child." }, // p.8
      { title: "Homework visibility", detail: "See assignments and due dates at a glance." }, // p.8
    ],
    image: "/education/class-saathi/parent-app.webp",
    imageAlt: "Class Saathi parent app — today's performance, quiz sets and homework",
  },
  {
    id: "admin",
    label: "Admin",
    headline: "Whole-school visibility in real time",
    blurb: "Instant monitoring and smart insights across every class.", // p.4, p.8
    features: [
      { title: "Real-time monitoring", detail: "Participation rates and assessment scores across classes, live." }, // p.8
      { title: "Monthly LMS reports", detail: "Reports tailored to each class, ready to download." }, // p.8
      { title: "School dashboard", detail: "Classes, students, polls and activity in one place." }, // p.8
    ],
    image: "/education/class-saathi/admin-dashboard.webp",
    imageAlt: "Class Saathi school dashboard — participation rate, assessment scores and class progress",
  },
];

// Simulator question bank — factual K-12 content + one brochure-verified
// Class Saathi question. classAnswers simulate a 23-student class.
export const simulatorQuestions: SimQuestion[] = [
  {
    id: 1,
    subject: "Math",
    question: "What is 15% of 120?",
    options: { A: "15", B: "18", C: "20", D: "22" },
    correct: "B",
    explanation: "15% of 120 = (15 ÷ 100) × 120 = 18.",
    classAnswers: { A: 2, B: 16, C: 3, D: 2 },
  },
  {
    id: 2,
    subject: "Math",
    question: "What is the ratio of 45 seconds to 3 minutes, in simplest form?",
    options: { A: "1 : 3", B: "1 : 4", C: "3 : 4", D: "4 : 5" },
    correct: "B",
    explanation: "3 minutes = 180 seconds, so the ratio is 45 : 180 = 1 : 4.",
    classAnswers: { A: 4, B: 14, C: 3, D: 2 },
  },
  {
    id: 3,
    subject: "Science",
    question: "Which planet in our solar system is known for its prominent rings?",
    options: { A: "Jupiter", B: "Mars", C: "Saturn", D: "Neptune" },
    correct: "C",
    explanation: "Saturn has the most extensive and visible ring system in the solar system.",
    classAnswers: { A: 3, B: 1, C: 17, D: 2 },
  },
  {
    id: 4,
    subject: "Science",
    question: "Which part of a plant makes food using sunlight?",
    options: { A: "Roots", B: "Leaves", C: "Stem", D: "Flowers" },
    correct: "B",
    explanation: "Leaves make food through photosynthesis, using sunlight, water and carbon dioxide.",
    classAnswers: { A: 2, B: 18, C: 2, D: 1 },
  },
  {
    id: 5,
    subject: "Class Saathi",
    question: "How does a Class Saathi student clicker send answers to the teacher's device?",
    options: { A: "Wi-Fi", B: "Bluetooth", C: "SIM card", D: "Infrared" },
    correct: "B",
    // Brochure p.2 ("Bluetooth clicker") + p.3 ("No internet required").
    explanation: "Class Saathi clickers use Bluetooth, so a class can run with no internet connection at all.",
    classAnswers: { A: 3, B: 17, C: 1, D: 2 },
  },
];

// 6 vetted FAQs — brochure-only facts (battery/curriculum specifics from the
// AI draft were unverifiable and are replaced; see Task 11 verification step).
export const educationFaqs = [
  {
    q: "How do Class Saathi clickers connect to the teacher's device?",
    a: "Each student clicker connects over Bluetooth to the Class Saathi application running on the teacher's phone, tablet or laptop, and answers are recorded instantly — there is no wiring and no per-student screen.", // p.2, p.3
  },
  {
    q: "Does Class Saathi need an internet connection in class?",
    a: "No. In-class quizzes and polling run with no internet required — responses travel from clicker to the teacher's device over Bluetooth, which is why it suits classrooms with limited connectivity.", // p.3
  },
  {
    q: "What does a Class Saathi classroom setup include?",
    a: "A classroom runs on student clickers, a teacher clicker and a USB receiver, paired with the Class Saathi application on the teacher's device. Exact kit configurations depend on class size — request a demo and we'll size it for your school.", // p.2
  },
  {
    q: "What do teachers get beyond quizzes?",
    a: "Saathi AI can generate quizzes from URLs, documents or prompts, build lesson plans aligned with a teacher's own material, and produce downloadable insight reports for each student and the whole class. A built-in class kit adds tools like a timer, spinner, dice, team maker and vote.", // pp.5–6
  },
  {
    q: "Who is TagHive?",
    a: "TagHive is the education-technology company behind Class Saathi, operating in South Korea and India, and accelerated by Samsung C-Lab. Class Saathi® is TagHive's clicker-based learning and assessment solution.", // p.1, p.10
  },
  {
    q: "How do we get pricing or a demo for our school?",
    a: "Use the demo request form on this page. An Aplus education specialist will reach out within 1 business day with pricing, a live demonstration and a rollout plan sized to your classrooms.",
  },
];

export const leadFormOptions = {
  studentCounts: ["Under 300", "300 – 800", "800 – 1,500", "1,500+"],
  goals: [
    "Improve class participation",
    "Formative assessment & data",
    "AI-powered learning tools",
    "Exploring smart classroom options",
  ],
};

export const educationClosing = {
  headline: "Bring Class Saathi to your classrooms",
  sub: "See the clicker experience live and get a rollout plan for your school.",
  trademark: "Class Saathi® is a registered trademark of TagHive Inc.",
};
```

- [ ] **Step 1.2: Write the failing test** `data/education.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import * as education from "./education";
import {
  educationAwards,
  educationFaqs,
  ecosystemTabs,
  simulatorQuestions,
  howItWorksSteps,
} from "./education";

/** Flatten every string in the module for content-policy scans. */
function allText(): string {
  return JSON.stringify(education);
}

describe("education content truth policy", () => {
  it("contains zero partnership language", () => {
    expect(allText()).not.toMatch(/authori[sz]ed|official|certified|partner/i);
  });

  it("mentions Samsung only as 'Samsung C-Lab' attribution", () => {
    const text = allText();
    const samsungHits = text.match(/Samsung(?! C-Lab)/g) ?? [];
    expect(samsungHits).toHaveLength(0);
  });

  it("contains none of the dropped fabricated claims", () => {
    expect(allText()).not.toMatch(/CS-25|CS-40|CS-80|500,?000|500k|5,?000\+ schools|CR2032|12%/i);
  });
});

describe("education content shape", () => {
  it("has exactly 8 awards, all with title/issuer/year", () => {
    expect(educationAwards).toHaveLength(8);
    for (const a of educationAwards) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.issuer.length).toBeGreaterThan(0);
      expect(a.year).toMatch(/^\d{4}$/);
    }
  });

  it("has exactly 6 FAQs with non-empty answers", () => {
    expect(educationFaqs).toHaveLength(6);
    for (const f of educationFaqs) {
      expect(f.q.endsWith("?")).toBe(true);
      expect(f.a.length).toBeGreaterThan(40);
    }
  });

  it("has the 4 stakeholder tabs in order", () => {
    expect(ecosystemTabs.map((t) => t.id)).toEqual(["teacher", "student", "parent", "admin"]);
    for (const t of ecosystemTabs) {
      expect(t.features.length).toBeGreaterThanOrEqual(3);
      expect(t.image).toMatch(/^\/education\/class-saathi\/.+\.webp$/);
    }
  });

  it("has 4 how-it-works steps (brochure p.9)", () => {
    expect(howItWorksSteps).toHaveLength(4);
  });

  it("simulator questions are well-formed and answerable", () => {
    expect(simulatorQuestions.length).toBeGreaterThanOrEqual(4);
    for (const q of simulatorQuestions) {
      expect(["A", "B", "C", "D"]).toContain(q.correct);
      expect(Object.keys(q.options)).toEqual(["A", "B", "C", "D"]);
      const total = Object.values(q.classAnswers).reduce((s, n) => s + n, 0);
      expect(total).toBe(23); // fixed simulated class size
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });
});
```

- [ ] **Step 1.3:** Run `npx vitest run data/education.test.ts` — expect FAIL
  (module missing) if test written first, then PASS once both files exist.
  Fix any classAnswers sums that don't equal 23.
- [ ] **Step 1.4:** Commit: `git add data/education.ts data/education.test.ts && git commit -m "feat(education): Class Saathi content data with truth-policy tests"`

---

### Task 2: Taxonomy entry + zero-product guards

**Files:**
- Modify: `data/categories.ts` (add slug + entry)
- Create: `lib/nonEmptyCategories.ts`
- Modify: `components/ProductsCategoryNav.tsx`, `components/ProductCatalogSection.tsx`,
  `app/products/page.tsx`
- Test: extend `data/education.test.ts`

**Interfaces:**
- Produces: `CategorySlug` includes `"education"`; `categoriesWithProducts: ProductCategory[]`
  exported from `lib/nonEmptyCategories.ts`.

- [ ] **Step 2.1:** In `data/categories.ts` add `| "education"` to `CategorySlug` and
  append this entry to `productCategories` (after `software`):

```ts
  {
    id: "education",
    name: "Education",
    navLabel: "Education",
    tagline: "Smart classrooms & AI-powered learning",
    subtitle: "Class Saathi clicker-based learning and AI assessment that gets every student participating.",
    useCases: ["K-12 Schools", "Coaching Institutes", "Smart Classrooms", "Formative Assessment"],
    description:
      "Class Saathi smart classroom solutions — Bluetooth clickers and an AI learning platform that make every lesson fully participative, with no internet required in class.",
    overview:
      "Class Saathi, by TagHive, combines simple Bluetooth clickers with an AI-powered learning and assessment platform so every student in the room answers every question — with no internet required in class. Teachers get instant question-by-question visibility, AI-generated quizzes and lesson plans, and downloadable insights for each student; school leaders get real-time dashboards and monthly reports. Aplus Technology Solutions helps schools across India evaluate and deploy Class Saathi, from live demos to classroom rollout and ongoing support.",
  },
```

- [ ] **Step 2.2:** Create `lib/nonEmptyCategories.ts`:

```ts
import { products } from "@/data/products";
import { productCategories, type ProductCategory } from "@/data/categories";

/**
 * Categories with at least one catalog product. A zero-product category
 * (Education — its category page is a standalone landing, not a product grid)
 * keeps its navbar/sitemap presence but must render no chip, tab, or section
 * on product-listing surfaces.
 */
export const categoriesWithProducts: ProductCategory[] = productCategories.filter(
  (cat) => products.some((p) => p.category === cat.name)
);
```

- [ ] **Step 2.3:** In `components/ProductsCategoryNav.tsx` replace the
  `productCategories` import with `import { categoriesWithProducts } from "@/lib/nonEmptyCategories";`
  and substitute all five usages (`replace_all`). Same substitution in
  `components/ProductCatalogSection.tsx` (two usages: initial tab + tab map).
  In `app/products/page.tsx` pass `productCategories={categoriesWithProducts}`
  to `ProductsClientShell` (drop the now-unused `productCategories` import if
  nothing else uses it).
- [ ] **Step 2.4:** Extend `data/education.test.ts` with the guard test:

```ts
import { productCategories, getCategoryById } from "./categories";
import { categoriesWithProducts } from "@/lib/nonEmptyCategories";

describe("education category taxonomy", () => {
  it("registers the education category", () => {
    const cat = getCategoryById("education");
    expect(cat?.name).toBe("Education");
    expect(cat?.navLabel).toBe("Education");
  });

  it("education copy obeys the truth policy", () => {
    const text = JSON.stringify(getCategoryById("education"));
    expect(text).not.toMatch(/authori[sz]ed|official|certified|partner/i);
    expect(text.match(/Samsung(?! C-Lab)/g) ?? []).toHaveLength(0);
  });

  it("zero-product categories are excluded from product-listing surfaces", () => {
    const ids = categoriesWithProducts.map((c) => c.id);
    expect(ids).not.toContain("education");
    // every other current category has products and must stay
    for (const cat of productCategories.filter((c) => c.id !== "education")) {
      expect(ids).toContain(cat.id);
    }
  });
});
```

- [ ] **Step 2.5:** Run `npm test` — expect PASS. If any existing suite assumed the
  old category count or that every category has products (e.g. redirects,
  categoryFaq), fix the assumption, not the guard.
- [ ] **Step 2.6:** Commit: `feat(education): add education category + zero-product listing guards`

---

### Task 3: Route branch, metadata, OG image

**Files:**
- Modify: `app/categories/[slug]/page.tsx`, `app/categories/[slug]/ogAlt.ts`,
  `app/categories/[slug]/opengraph-image.tsx`
- Create: `components/education/EducationLanding.tsx` (minimal composer, grows in Tasks 5–11)
- Test: `app/categories/[slug]/ogAlt.test.ts`

**Interfaces:**
- Produces: `EducationLanding` — server component, no props, renders `<main>` with
  section anchors `#simulator`, `#lead-form`, `#faq`.

- [ ] **Step 3.1:** Minimal `components/education/EducationLanding.tsx`:

```tsx
import { educationHero } from "@/data/education";

export default function EducationLanding() {
  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-gray-900">
          {educationHero.headline} {educationHero.headlineAccent}
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">{educationHero.sub}</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 3.2:** In `app/categories/[slug]/page.tsx`:
  - `import EducationLanding from "@/components/education/EducationLanding";`
  - In `CategoryPage`, immediately after the `if (!category) return notFound();`
    guard: `if (category.id === "education") return <EducationLanding />;`
  - In `generateMetadata`, before the `isVc` block:

```ts
  if (category.id === "education") {
    return {
      title: "Class Saathi Smart Classrooms — Clickers & AI Learning",
      description:
        "Class Saathi by TagHive — Bluetooth clickers and AI-powered assessment for 100% student participation, no internet required. School demos, deployment and support across India.",
      keywords: [
        "Class Saathi",
        "classroom clickers",
        "student response system",
        "smart classroom India",
        "TagHive",
        "Aplus Technology Solutions",
      ],
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title: "Education | Aplus Technology Solutions",
        description: category.description,
        images: [{ url: `/categories/${slug}/opengraph-image`, width: 1200, height: 630, alt: category.navLabel }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Education | Aplus Technology Solutions",
        description: category.description,
        images: [`/categories/${slug}/opengraph-image`],
      },
    };
  }
```

- [ ] **Step 3.3:** `ogAlt.ts` — non-Samsung categories share the neutral branch:

```ts
export function categoryOgAltFor(category: Pick<ProductCategory, "id" | "navLabel">): string {
  return category.id === "video-conferencing" || category.id === "education"
    ? `${category.navLabel} — Aplus Technology Solutions`
    : "Samsung Commercial Display Category — Aplus Technology Solutions";
}
```

  Add to `ogAlt.test.ts`:

```ts
  it("returns a neutral, Samsung-free alt for Education", () => {
    const alt = categoryOgAltFor({ id: "education", navLabel: "Education" });
    expect(alt).not.toMatch(/samsung/i);
    expect(alt).toMatch(/Education/);
  });
```

- [ ] **Step 3.4:** `opengraph-image.tsx` — education must not render
  "Samsung Category" or "0 Products". Add after `category` resolves:

```ts
  const isEducation = category.id === "education";
  const eyebrow = isEducation
    ? "Education"
    : category.id === "video-conferencing"
    ? "Video Conferencing"
    : "Samsung Category";
```

  and replace the product-count pill's text with:

```ts
  {isEducation ? "Class Saathi — smart classrooms & AI-powered learning" : `${productCount} Products in This Category`}
```

  For education swap the background to an emerald ramp and the glow/pill accents
  from blue to emerald (e.g. background
  `linear-gradient(135deg, #04140c 0%, #0b3a25 60%, #06281a 100%)`, glow
  `rgba(16,185,129,0.18)`, pill borders/text emerald equivalents) — keep every
  style Satori-safe: only `display:flex`, no `inline-flex` (project memory).
- [ ] **Step 3.5:** Run `npm test` (ogAlt suite), then `npm run dev` and verify
  `http://localhost:3000/categories/education` renders the placeholder hero,
  navbar Products dropdown shows Education, and
  `http://localhost:3000/categories/education/opengraph-image` renders the
  emerald card. Kill the dev server by port PID afterwards (project memory).
- [ ] **Step 3.6:** Commit: `feat(education): education route branch, metadata and OG image`

---

### Task 4: Brochure image extraction → `public/education/class-saathi/`

**Files:**
- Create: `scripts/extract-class-saathi-images.py`
- Create: `public/education/class-saathi/*.webp` (hero + 4 tab screenshots minimum)

- [ ] **Step 4.1:** `pip install pypdf pillow` (user-level; skip if present).
- [ ] **Step 4.2:** Write `scripts/extract-class-saathi-images.py`:

```python
"""Extract embedded images from the Class Saathi brochure, per page, to a
review directory. Run, eyeball the output, then convert keepers to webp.

Usage:
  python scripts/extract-class-saathi-images.py extract <pdf> <outdir>
  python scripts/extract-class-saathi-images.py convert <src> <dest.webp> [max_width]
"""
import sys
from pathlib import Path
from pypdf import PdfReader
from PIL import Image

def extract(pdf_path: str, outdir: str) -> None:
    out = Path(outdir); out.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(pdf_path)
    for pno, page in enumerate(reader.pages, start=1):
        for ino, img in enumerate(page.images):
            name = f"p{pno:02d}_{ino:02d}_{img.name}".replace("/", "_")
            path = out / name
            path.write_bytes(img.data)
            try:
                with Image.open(path) as im:
                    print(f"{name}: {im.size[0]}x{im.size[1]} {im.mode}")
            except Exception as e:  # unreadable/exotic stream — note and move on
                print(f"{name}: unreadable ({e})")

def convert(src: str, dest: str, max_width: int = 1200) -> None:
    with Image.open(src) as im:
        im = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
        if im.width > max_width:
            im = im.resize((max_width, round(im.height * max_width / im.width)), Image.LANCZOS)
        im.save(dest, "WEBP", quality=82, method=6)
        print(f"{dest}: {im.size[0]}x{im.size[1]}")

if __name__ == "__main__":
    if sys.argv[1] == "extract":
        extract(sys.argv[2], sys.argv[3])
    else:
        convert(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 1200)
```

- [ ] **Step 4.3:** Run extraction against
  `C:\Users\samee\Downloads\Class_Saathi.pdf` into the session scratchpad.
  Review candidates with the Read tool (images render visually). Targets:
  - p.2 clicker product render (student + teacher clicker + dongle) → `clicker-duo.webp` (hero)
  - p.5 Saathi Genie quiz-generation frame → `teacher-ai-quiz.webp`
  - p.7 student app phone frame → `student-app.webp`
  - p.8 parent app phone frame → `parent-app.webp`
  - p.8 school dashboard tablet frame → `admin-dashboard.webp`
- [ ] **Step 4.4:** Convert keepers into `public/education/class-saathi/` with the
  `convert` subcommand (hero at max_width 1600, screenshots 1200). If a target
  extracts poorly (tiny/fragmented/JP2 artifacts), note it and: hero falls back
  to a composed layout without photography; tab images fall back to the closest
  clean page screenshot. Do not use the AI Studio draft's Google-hosted images.
- [ ] **Step 4.5:** Commit: `feat(education): extract optimized Class Saathi brochure imagery`

---

### Task 5: EducationHero + AwardsStrip

**Files:**
- Create: `components/education/EducationHero.tsx` (server)
- Create: `components/education/AwardsStrip.tsx` (server)
- Modify: `components/education/EducationLanding.tsx`

**Interfaces:**
- Consumes: `educationHero`, `educationAwards` from `@/data/education`; hero image
  `/education/class-saathi/clicker-duo.webp` from Task 4.
- Produces: `<EducationHero />`, `<AwardsStrip />` — no props.

- [ ] **Step 5.1:** `EducationHero.tsx` — light premium hero, emerald reserved for
  brand moments. Two-column ≥lg: left = eyebrow, h1 (headline + emerald accent
  line), sub, chips row, CTA pair; right = framed hero image. CTAs are anchors:

```tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { educationHero } from "@/data/education";

export default function EducationHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-4">
            {educationHero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.05] tracking-tight">
            {educationHero.headline}
            <span className="block text-emerald-700">{educationHero.headlineAccent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-gray-600 text-base md:text-lg leading-relaxed">
            {educationHero.sub}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {educationHero.chips.map((chip) => (
              <span key={chip} className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold">
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="#simulator" className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg">
              <Play size={16} /> Try the live simulator
            </Link>
            <Link href="#lead-form" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-emerald-300 text-gray-800 hover:text-emerald-700 px-7 py-3.5 rounded-xl font-semibold transition-colors">
              Request a school demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl bg-white border border-emerald-100 shadow-xl p-8 md:p-12">
            <Image
              src="/education/class-saathi/clicker-duo.webp"
              alt="Class Saathi student and teacher Bluetooth clickers with USB receiver"
              width={880}
              height={660}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.2:** `AwardsStrip.tsx` — restrained monochrome credibility band:

```tsx
import { Award } from "lucide-react";
import { educationAwards } from "@/data/education";

export default function AwardsStrip() {
  return (
    <section className="bg-white border-b border-gray-100" aria-label="Class Saathi awards and recognition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">
          Recognised across global education technology
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
          {educationAwards.map((award) => (
            <div key={award.title} className="flex items-start gap-3">
              <Award size={16} className="mt-0.5 shrink-0 text-gray-300" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{award.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{award.issuer} · {award.year}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.3:** Wire both into `EducationLanding` (replace the placeholder
  section): `<EducationHero />` then `<AwardsStrip />`.
- [ ] **Step 5.4:** Dev-run, view `/categories/education`, screenshot-check the hero
  at mobile + desktop widths. Kill server by port PID.
- [ ] **Step 5.5:** Commit: `feat(education): premium hero and awards strip`

---

### Task 6: ParticipationComparison + HowItWorks

**Files:**
- Create: `components/education/ParticipationComparison.tsx` (server, wrapped in `AnimatedSection`)
- Create: `components/education/HowItWorks.tsx` (server)
- Modify: `components/education/EducationLanding.tsx`

**Interfaces:** consumes `participationComparison`, `howItWorksSteps`.

- [ ] **Step 6.1:** `ParticipationComparison.tsx` — two panels; before = muted
  slate, after = emerald-washed with ring; big stat (40% / 100%) + point list
  (X / check icons). Use `AnimatedSection` (`direction="up"`, staggered `delay`)
  around each panel. Section header eyebrow "The participation gap", h2
  "From a silent majority to a hundred-percent classroom".

```tsx
import { Check, X } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { participationComparison } from "@/data/education";

export default function ParticipationComparison() {
  const { before, after } = participationComparison;
  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">The participation gap</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            From a silent majority to a hundred-percent classroom
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="h-full bg-white rounded-3xl border border-gray-200 p-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{before.title}</p>
              <p className="mt-4 text-5xl font-bold text-gray-300">{before.stat}</p>
              <p className="text-sm text-gray-400 mt-1">{before.statLabel}</p>
              <ul className="mt-6 space-y-3">
                {before.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-gray-500">
                    <X size={16} className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.12}>
            <div className="h-full bg-white rounded-3xl border-2 border-emerald-200 ring-4 ring-emerald-50 p-8">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">{after.title}</p>
              <p className="mt-4 text-5xl font-bold text-emerald-600">{after.stat}</p>
              <p className="text-sm text-emerald-700/70 mt-1">{after.statLabel}</p>
              <ul className="mt-6 space-y-3">
                {after.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6.2:** `HowItWorks.tsx` — 4 numbered step cards in a grid
  (`md:grid-cols-4`), numbered emerald tiles, connective top border. Same
  section rhythm as above (white background this time), heading "How Class
  Saathi works in class", steps from `howItWorksSteps`, each wrapped in
  `AnimatedSection` with `delay={i * 0.08}`.
- [ ] **Step 6.3:** Wire into `EducationLanding` after `<AwardsStrip />`.
- [ ] **Step 6.4:** Dev-run visual check; kill server. Commit:
  `feat(education): participation comparison and how-it-works sections`

---

### Task 7: EcosystemTabs (client)

**Files:**
- Create: `components/education/EcosystemTabs.tsx` (`"use client"`)
- Modify: `components/education/EducationLanding.tsx`

**Interfaces:** consumes `ecosystemTabs` (with Task 4 images). No props.

- [ ] **Step 7.1:** Build the tabbed section: pill tab bar (Teacher / Student /
  Parent / Admin) with an animated active pill (framer-motion `layoutId`),
  panel = left copy column (headline, blurb, feature list with emerald check
  tiles) + right screenshot in a framed card. `AnimatePresence mode="wait"`
  fade/slide between tabs, `next/image` for screenshots:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ecosystemTabs } from "@/data/education";

export default function EcosystemTabs() {
  const [activeId, setActiveId] = useState(ecosystemTabs[0].id);
  const active = ecosystemTabs.find((t) => t.id === activeId) ?? ecosystemTabs[0];

  return (
    <section className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-3">One platform, four roles</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Built for everyone in the school
          </h2>
        </div>

        <div role="tablist" aria-label="Class Saathi stakeholders" className="flex flex-wrap justify-center gap-2 mb-10">
          {ecosystemTabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className="relative px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
              >
                {isActive && (
                  <motion.span
                    layoutId="eduTabPill"
                    className="absolute inset-0 bg-gray-900 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600 hover:text-gray-900"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12"
          >
            <div className="lg:col-span-5">
              <h3 className="text-2xl font-bold text-gray-900">{active.headline}</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{active.blurb}</p>
              <ul className="mt-6 space-y-4">
                {active.features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                      <p className="text-sm text-gray-500">{f.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:p-6">
                <Image
                  src={active.image}
                  alt={active.imageAlt}
                  width={1200}
                  height={840}
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
```

- [ ] **Step 7.2:** Wire into `EducationLanding` after `<HowItWorks />`. Dev-run:
  all four tabs switch, images load. Kill server. Commit:
  `feat(education): stakeholder ecosystem tabs`

---

### Task 8: ClickerSimulator (client, code-split)

**Files:**
- Create: `components/education/ClickerSimulator.tsx` (`"use client"`)
- Modify: `components/education/EducationLanding.tsx` (dynamic import)

**Interfaces:** consumes `simulatorQuestions`, `SimOption`. No props. Rendered
inside `<section id="simulator">` on the page's single dark band.

**Behavioral contract (rebuilt from the draft, trimmed of BLE-tuner/battery/
custom-question bulk and all fabricated claims):**
- Phases: `idle` (pick A–D) → `armed` (option selected, submit enabled) →
  `transmitting` (~450 ms delay) → `revealed` (correct/incorrect, explanation,
  class distribution bars including the visitor's vote, Next enabled).
- Distribution = `classAnswers` + 1 for the visitor's option (24 total).
- Next cycles questions with wrap-around; Restart resets to question 0, idle.

- [ ] **Step 8.1:** Implement:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { simulatorQuestions, type SimOption } from "@/data/education";

const OPTION_KEYS: SimOption[] = ["A", "B", "C", "D"];
const KEY_COLORS: Record<SimOption, string> = {
  A: "bg-rose-500 border-rose-700",
  B: "bg-sky-500 border-sky-700",
  C: "bg-amber-500 border-amber-700",
  D: "bg-violet-500 border-violet-700",
};

type Phase = "idle" | "armed" | "transmitting" | "revealed";

export default function ClickerSimulator() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<SimOption | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const question = simulatorQuestions[qIndex];
  const isCorrect = selected === question.correct;

  const pick = (opt: SimOption) => {
    if (phase === "transmitting" || phase === "revealed") return;
    setSelected(opt);
    setPhase("armed");
  };

  const submit = () => {
    if (phase !== "armed" || !selected) return;
    setPhase("transmitting");
    setTimeout(() => setPhase("revealed"), 450);
  };

  const next = () => {
    setQIndex((i) => (i + 1) % simulatorQuestions.length);
    setSelected(null);
    setPhase("idle");
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setPhase("idle");
  };

  const totalResponses = OPTION_KEYS.reduce((s, k) => s + question.classAnswers[k], 0) + (selected ? 1 : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Handheld clicker */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-70 bg-gradient-to-b from-gray-100 to-gray-300 rounded-[2.5rem] p-6 border-4 border-white shadow-2xl">
          <div className="bg-slate-950 rounded-2xl p-4 mb-6 text-center min-h-20 flex flex-col justify-center border border-slate-700">
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/60 mb-1">
              {phase === "transmitting" ? "Sending…" : phase === "revealed" ? "Answer sent" : "Class Saathi"}
            </p>
            <p className="text-sm font-mono font-bold text-emerald-300">
              {phase === "idle" && "Press A, B, C or D"}
              {phase === "armed" && `Ready: ${selected} — press Submit`}
              {phase === "transmitting" && "• • •"}
              {phase === "revealed" && `Sent: ${selected}`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {OPTION_KEYS.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={phase === "transmitting" || phase === "revealed"}
                aria-label={`Answer ${opt}`}
                className={`aspect-square rounded-full text-2xl font-bold text-white border-b-4 shadow-lg transition-transform active:translate-y-0.5 disabled:opacity-40 ${KEY_COLORS[opt]} ${selected === opt ? "ring-4 ring-white/70 scale-105" : ""}`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-300">
            <button
              onClick={submit}
              disabled={phase !== "armed"}
              className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 disabled:bg-slate-400 transition-colors"
            >
              Submit
            </button>
            <button
              onClick={restart}
              className="py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 bg-white flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} /> Restart
            </button>
          </div>
        </div>
      </div>

      {/* Smartboard */}
      <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-4 mb-6">
          <span>Classroom smartboard · {question.subject}</span>
          <span>Question {qIndex + 1} / {simulatorQuestions.length}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white leading-snug mb-6">{question.question}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {OPTION_KEYS.map((opt) => {
            const revealed = phase === "revealed";
            const correct = question.correct === opt;
            const chosen = selected === opt;
            return (
              <div
                key={opt}
                className={`p-4 rounded-2xl border text-sm flex items-start gap-3 transition-colors ${
                  revealed && correct
                    ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-100"
                    : revealed && chosen
                    ? "bg-rose-950/70 border-rose-500/70 text-rose-100"
                    : chosen
                    ? "bg-emerald-900/30 border-emerald-500/50 text-white"
                    : "bg-slate-900 border-white/10 text-slate-300"
                }`}
              >
                <span className="w-6 h-6 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{opt}</span>
                <span>{question.options[opt]}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === "revealed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900/80 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden="true" />
                ) : (
                  <XCircle size={20} className="shrink-0 text-rose-400" aria-hidden="true" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">{isCorrect ? "Correct!" : "Not quite."}</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <p className="text-[11px] font-mono text-slate-400">Class responses · {totalResponses} students</p>
                {OPTION_KEYS.map((opt) => {
                  const count = question.classAnswers[opt] + (selected === opt ? 1 : 0);
                  const pct = Math.round((count / totalResponses) * 100);
                  return (
                    <div key={opt} className="flex items-center gap-3 text-xs">
                      <span className="w-4 text-right font-bold text-slate-400">{opt}</span>
                      <div className="flex-1 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${question.correct === opt ? "bg-emerald-500" : "bg-slate-600"}`}
                        />
                      </div>
                      <span className="w-14 text-right font-mono text-slate-300">{pct}% ({count})</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase === "revealed" && (
          <button
            onClick={next}
            className="mt-5 ml-auto inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            Next question <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2:** In `EducationLanding`, add the dark stage section:

```tsx
import dynamic from "next/dynamic";
const ClickerSimulator = dynamic(() => import("./ClickerSimulator"));
```

  and in JSX (after `<EcosystemTabs />`):

```tsx
      <section id="simulator" className="scroll-mt-24 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Live simulator</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Try the clicker yourself</h2>
            <p className="mt-3 text-slate-400 text-sm md:text-base">
              Press a key, submit your answer, and watch the class results come in — exactly the loop students experience.
            </p>
          </div>
          <ClickerSimulator />
        </div>
      </section>
```

- [ ] **Step 8.3:** Dev-run: full interaction loop (pick → submit → reveal →
  next → wrap-around → restart). Kill server. Commit:
  `feat(education): interactive clicker simulator on dark stage`

---

### Task 9: Lead pipeline backend (schema, Zoho segment, email template, env)

**Files:**
- Modify: `lib/formSchemas.ts`, `lib/zoho.ts`, `app/api/contact/route.ts`, `.env.local`
- Test: `lib/zoho.test.ts` (new)

**Interfaces:**
- Produces: `classSaathiLeadSchema`, `ClassSaathiLeadValues` (formSchemas);
  `buildZohoLead(body: Record<string, string>)` exported from `lib/zoho.ts`;
  contact route accepts `lead_source: "Class Saathi"` + keys
  `role`, `school` (as `company`), `city`, `student_count`, `primary_goal`.

- [ ] **Step 9.1:** Append to `lib/formSchemas.ts`:

```ts
export const classSaathiLeadSchema = z.object({
  name,
  email,
  phone,
  role: z.string().trim().min(2, "Please enter your role").max(80, "Role is too long"),
  school: z.string().trim().min(2, "Please enter your school name").max(120, "School name is too long"),
  city: z.string().trim().min(2, "Please enter your city").max(80, "City name is too long"),
  student_count: z.string().trim().min(1, "Please select a student count"),
  primary_goal: z.string().trim().min(1, "Please select a primary goal"),
  message: z.string().trim().max(1000, "Message is too long").optional().or(z.literal("")),
});
export type ClassSaathiLeadValues = z.infer<typeof classSaathiLeadSchema>;
```

- [ ] **Step 9.2: Write the failing test** `lib/zoho.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildZohoLead } from "./zoho";

describe("buildZohoLead", () => {
  const base = { name: "Priya Sharma", email: "p@school.edu", phone: "+91 99999 99999" };

  it("defaults Lead_Source to Web Site", () => {
    expect(buildZohoLead(base).Lead_Source).toBe("Web Site");
  });

  it("passes lead_source through as the Zoho segment", () => {
    const lead = buildZohoLead({ ...base, lead_source: "Class Saathi", company: "Sunrise Public School" });
    expect(lead.Lead_Source).toBe("Class Saathi");
    expect(lead.Company).toBe("Sunrise Public School");
  });

  it("splits first/last name as before", () => {
    const lead = buildZohoLead(base);
    expect(lead.First_Name).toBe("Priya");
    expect(lead.Last_Name).toBe("Sharma");
  });
});
```

  Run `npx vitest run lib/zoho.test.ts` — expect FAIL (`buildZohoLead` not exported).

- [ ] **Step 9.3:** Refactor `lib/zoho.ts`: extract the lead-object construction
  from `createZohoLead` into an exported pure function; `createZohoLead` calls it.
  The only behavioral change is `Lead_Source`:

```ts
/** Pure lead-shape builder, extracted for testability. lead_source becomes the
 *  filterable Zoho segment (e.g. "Class Saathi"); absent ⇒ historical "Web Site". */
export function buildZohoLead(body: Record<string, string>) {
  const nameParts = (body.name ?? "").trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts[0] : "";

  const description = [
    body.items_list ? `Products Requested:\n${body.items_list}` : "",
    body.product ? `Product: ${body.product}` : "",
    body.inquiry_type ? `Inquiry Type: ${body.inquiry_type}` : "",
    body.message && body.message !== body.items_list ? `Message: ${body.message}` : "",
    body.requirements ? `Notes: ${body.requirements}` : "",
    body.subject ? `Ref: ${body.subject}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    Last_Name: lastName || "Unknown",
    First_Name: firstName,
    Email: body.email,
    Phone: body.phone,
    Company: body.company || "Not provided",
    Description: description,
    Lead_Source: body.lead_source || "Web Site",
    Lead_Status: "New",
  };
}
```

  Run the test again — expect PASS. Run `npm test` — full suite green.

- [ ] **Step 9.4:** `app/api/contact/route.ts` changes:
  - Next to `TO_EMAIL`, add (comment documents the env var per spec):

```ts
// Class Saathi (education) leads route to the education owner. Set
// CLASS_SAATHI_TO_EMAIL alongside CONTACT_TO_EMAIL; falls back to TO_EMAIL.
const CLASS_SAATHI_TO_EMAIL = process.env.CLASS_SAATHI_TO_EMAIL ?? TO_EMAIL;
```

  - Add `buildClassSaathiEmail(b: Record<string, string>)` beside the other
    builders — same table skeleton as `buildContactEmail` with: emerald header
    (`linear-gradient(135deg,#065f46,#059669)`), eyebrow "Aplus Technology
    Solutions · Education", heading "New Class Saathi School Lead", sub line
    `${esc(b.company ?? "")}`; a "School details" grid using the existing
    `row()` helper for Name, Email, Phone, Role (`b.role`), School
    (`b.company`), City (`b.city`), Students (`b.student_count`), Primary Goal
    (`b.primary_goal`) — omit rows whose value is empty, following the
    `b.company ?` pattern already used in `buildContactEmail`; then the message
    block and the standard reply footer.
  - In `POST`, replace the template/recipient selection:

```ts
    const isQuote = Boolean(body.items_list);
    const isClassSaathi = body.lead_source === "Class Saathi";
    const html = isClassSaathi
      ? buildClassSaathiEmail(body)
      : isQuote
      ? buildQuoteEmail(body)
      : buildContactEmail(body);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: isClassSaathi ? CLASS_SAATHI_TO_EMAIL : TO_EMAIL,
      ...
```

  All existing protections (origin, rate limit, honeypot, caps, string-shape
  validation) remain untouched.
- [ ] **Step 9.5:** Append to `.env.local` **only if the key is absent**
  (never overwrite the file): `CLASS_SAATHI_TO_EMAIL=sunil@aplustechsol.com`.
  Note for the final report: the same var must be added in Vercel.
- [ ] **Step 9.6:** `npm test` + `npx tsc --noEmit` green. Commit:
  `feat(education): Class Saathi lead routing, Zoho segment and email template`

---

### Task 10: BlueprintLeadForm (client, code-split) + analytics

**Files:**
- Create: `components/education/BlueprintLeadForm.tsx` (`"use client"`)
- Modify: `components/education/EducationLanding.tsx`

**Interfaces:** consumes `classSaathiLeadSchema`/`ClassSaathiLeadValues`,
`leadFormOptions`; POSTs the Task 9 payload contract.

- [ ] **Step 10.1:** Implement with react-hook-form + zodResolver (site pattern:
  `app/contact/page.tsx`). Split layout: left persuasion panel (heading "Get
  your school's Class Saathi blueprint", sub copy, three bullets: live demo for
  your teachers · pricing and rollout sized to your classrooms · deployment and
  support across India), right form card. Fields: name, role, school, city,
  email, phone, student_count (select from `leadFormOptions.studentCounts`),
  primary_goal (select from `leadFormOptions.goals`), message (optional
  textarea), plus the `company_website` honeypot input (sr-only, tabIndex -1).
  Submit handler:

```tsx
  async function onSubmit(values: ClassSaathiLeadValues) {
    setSubmitError("");
    const summary = [
      `Role: ${values.role}`,
      `School: ${values.school}`,
      `City: ${values.city}`,
      `Students: ${values.student_count}`,
      `Primary Goal: ${values.primary_goal}`,
      values.message ? `Message: ${values.message}` : "",
    ].filter(Boolean).join("\n");

    const payload: Record<string, string> = {
      lead_source: "Class Saathi",
      subject: `Class Saathi Lead — ${values.school}`,
      from_name: "Aplus Website — Class Saathi",
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.school,
      role: values.role,
      city: values.city,
      student_count: values.student_count,
      primary_goal: values.primary_goal,
      message: summary,
      company_website: honeypotRef.current?.value ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        trackEvent("class_saathi_lead_submitted", { student_count: values.student_count, primary_goal: values.primary_goal });
        if (posthog.__loaded) {
          posthog.capture("class_saathi_lead_submitted", { student_count: values.student_count, primary_goal: values.primary_goal });
        }
        setSubmitted({ school: values.school, name: values.name });
      } else {
        setSubmitError(
          res.status === 429
            ? "Too many requests — please try again in a few minutes."
            : "Something went wrong sending your request. Please try again."
        );
      }
    } catch {
      setSubmitError("We couldn't reach our server. Check your connection and try again.");
    }
  }
```

  (`import posthog from "posthog-js";` and `trackEvent` from `@/lib/analytics`.)
  Success state replaces the form card: emerald check icon, "Request received",
  submission summary (school, city, students, goal), and the line "Our
  education specialist will reach out within 1 business day." Error state:
  inline `role="alert"` box above the submit button; the button re-enables for
  retry. No invented kit SKUs, no promises on TagHive's behalf.
- [ ] **Step 10.2:** Wire into `EducationLanding`:
  `const BlueprintLeadForm = dynamic(() => import("./BlueprintLeadForm"));` and

```tsx
      <section id="lead-form" className="scroll-mt-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <BlueprintLeadForm />
        </div>
      </section>
```

- [ ] **Step 10.3:** Dev-run: submit with dev server env pointing at real
  `/api/contact` (localhost origin passes outside production). Verify 200 +
  success state, and a validation error surfaces per-field. Kill server.
- [ ] **Step 10.4:** Commit: `feat(education): blueprint lead form wired to contact pipeline`

---

### Task 11: FAQ + closing CTA + JSON-LD + fact verification

**Files:**
- Create: `components/education/EducationFaq.tsx` (server — native `<details>` accordion)
- Create: `components/education/ClosingCta.tsx` (server)
- Modify: `components/education/EducationLanding.tsx`, possibly `data/education.ts`

- [ ] **Step 11.1 (fact verification):** WebFetch `https://tag-hive.com` /
  `https://www.classsaathi.com` product pages. If battery life and curriculum
  alignment claims are verifiable there, swap FAQ items 3/4 for battery and
  curriculum Q&As citing those facts (update `data/education.ts`; tests still
  enforce the policy). If not verifiable, keep the shipped six as-is.
- [ ] **Step 11.2:** `EducationFaq.tsx` — mirror the category-page `<details>`
  accordion styling (rounded-2xl cards, chevron rotate on open, emerald
  accents), fed from `educationFaqs`, wrapped in
  `<section id="faq" className="scroll-mt-24 …">` with heading
  "Frequently asked questions".
- [ ] **Step 11.3:** `ClosingCta.tsx` — emerald-tinted band: `educationClosing`
  headline + sub, CTA pair repeating `#simulator` / `#lead-form` anchors, then
  the trademark small print (`educationClosing.trademark`) in `text-xs
  text-gray-400` at the very end of page content (above the site footer, which
  renders unchanged from the root layout).
- [ ] **Step 11.4:** Finalize `EducationLanding` composition + JSON-LD:

```tsx
import { breadcrumbLd, faqPageLd, jsonLdString } from "@/lib/jsonLd";
import { educationFaqs } from "@/data/education";

// inside the component:
  const jsonLd = [
    breadcrumbLd([
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Education", url: "/categories/education" },
    ]),
    faqPageLd(educationFaqs.map((f) => ({ question: f.q, answer: f.a }))),
  ];
```

  rendered via the standard
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />`.
  Final section order: Hero → AwardsStrip → ParticipationComparison →
  HowItWorks → EcosystemTabs → Simulator (dark) → BlueprintLeadForm → FAQ →
  ClosingCta.
- [ ] **Step 11.5:** Commit: `feat(education): FAQ, closing CTA and structured data`

---

### Task 12: Full verification + wrap-up

- [ ] **Step 12.1:** `npm test` — all suites green. `npx tsc --noEmit` — clean.
  `npm run lint` — clean.
- [ ] **Step 12.2:** `npm run build` — must pass (education is in
  `generateStaticParams`; build exercises the OG image route too).
- [ ] **Step 12.3:** Runtime verification via the project **verify** skill:
  - Navbar (desktop + mobile) shows Education → `/categories/education`.
  - Landing renders all 9 sections; hero CTAs scroll to `#simulator` /
    `#lead-form`; simulator full loop works; form submits successfully in dev.
  - `/products` shows **no** Education chip/tab/section; home "Browse Our Full
    Range" tabs unchanged (no Education tab); 404 page and empty-quote page
    Education pills link to the landing (sane).
  - View-source: no `authorized|official|certified|partner` on the education
    route; FAQPage JSON-LD present; `/sitemap.xml` contains
    `/categories/education`.
  - Kill any background dev/build servers by port PID (project memory).
- [ ] **Step 12.4:** Final commit of any verification fixes; report remaining
  manual steps to the user (Vercel env var `CLASS_SAATHI_TO_EMAIL`, TagHive
  asset fallback if extraction quality disappointed).

## Out of scope (per spec)

Catalog products for clicker kits, home-grid rework, admin leads dashboard,
city/blog cross-linking.
