/**
 * Class Saathi audience-segment and comparison pages.
 * One page each at /categories/education/{slug}.
 *
 * CONTENT TRUTH POLICY (inherited from data/education.ts): every claim traces
 * to the Class Saathi brochure or tag-hive.com. No partnership language —
 * Aplus is an independent solutions provider featuring Class Saathi. "Samsung"
 * only ever as "Samsung C-Lab". No numeric claim that is not already in
 * data/education.ts. Enforced by educationSegments.test.ts.
 *
 * Three pages, not three parallel audience pages: all verified Class Saathi
 * facts come from one brochure and four stakeholder feature sets, so a third
 * audience page would read as templated. The comparison page instead makes
 * category-level claims, which is policy-safe by construction. See the spec.
 */

export interface EducationSegment {
  slug: string;
  /** Short label for breadcrumbs and cross-link cards. */
  navLabel: string;
  /** SEO H1. */
  title: string;
  subtitle: string;
  /** ~50-word intro; also the meta description. */
  intro: string;
  /** Which data/education.ts ecosystemTabs stakeholder this page leads with. */
  leadStakeholder: "teacher" | "student" | "parent" | "admin" | null;
  points: { title: string; detail: string }[];
  faqs: { q: string; a: string }[];
  ctaHeading: string;
  /**
   * One-sentence closing-CTA body. Written per segment rather than derived
   * from leadStakeholder in the component — a two-way ternary on that field
   * collapsed "teacher" (coaching institutes run batches, not classrooms) and
   * null (the comparison page, which leads with no audience) onto the same
   * "classrooms" wording as "admin". Keep it operational (what Aplus will do),
   * not a new product claim, so it stays outside the truth-policy tests' scope.
   */
  ctaBody: string;
  /**
   * Closing-CTA button label. Same rationale as ctaBody: a single hardcoded
   * "Request a School Demo" button sat next to ctaBody's carefully-branched
   * noun and put "School" under the coaching-institutes and comparison pages,
   * which are not school-specific. Kept short for the button, not a new claim.
   */
  ctaLabel: string;
}

export const educationSegments: EducationSegment[] = [
  {
    slug: "k-12-schools",
    navLabel: "K-12 Schools",
    title: "Class Saathi for K-12 Schools — Clickers & AI Assessment",
    subtitle: "Whole-school participation and reporting, run over Bluetooth with no internet required in class.",
    intro:
      "K-12 schools need to know what's happening in every classroom, not just the ones a teacher happens to flag. Class Saathi pairs a Bluetooth clicker per student with real-time dashboards for school leadership and a parent app for home, so participation and progress are visible at every level — with no internet required during class.",
    leadStakeholder: "admin",
    points: [
      {
        title: "Real-time visibility across every class",
        detail:
          "School leadership sees participation rates and assessment scores across classes as they happen, not after test day, from a single school dashboard covering classes, students, polls and activity.",
      },
      {
        title: "Monthly reports, ready per class",
        detail:
          "Class Saathi generates monthly LMS reports tailored to each class, ready to download — giving admins a standing record without building spreadsheets by hand.",
      },
      {
        title: "Parents see progress and homework, not just report cards",
        detail:
          "The parent app tracks performance as it happens, surfaces the day's quiz sets to review together, and shows assignments and due dates at a glance — extending school visibility into the home.",
      },
      {
        title: "No internet required in the classroom",
        detail:
          "Student clickers connect to the teacher's device over Bluetooth, so quizzes and polling run in classrooms with limited or no connectivity — nothing depends on the school's Wi-Fi holding up.",
      },
      {
        title: "From 40% participation to 100%",
        detail:
          "Brochure data shows classrooms move from roughly 40% of students participating — a few confident students answering while the rest stay silent — to 100% student participation once every student has their own clicker.",
      },
    ],
    faqs: [
      {
        q: "How does a whole-school rollout of Class Saathi work?",
        a: "Each classroom is equipped with student clickers, a teacher clicker and a USB receiver, paired with the Class Saathi app on the teacher's device. Exact kit configurations depend on class size and number of classrooms — request a demo and Aplus will size a rollout plan for your school.",
      },
      {
        q: "What does school leadership actually see day to day?",
        a: "The admin dashboard shows participation rates and assessment scores across classes in real time, plus classes, students, polls and activity in one place, backed by a monthly LMS report tailored to each class.",
      },
      {
        q: "Do parents need internet at home to use the parent app?",
        a: "The parent app is what surfaces progress tracking, today's quiz sets and homework visibility at home; in-class quizzes themselves run over Bluetooth with no internet required, which is the connectivity constraint the brochure speaks to directly.",
      },
      {
        q: "How do we get a demo for our school?",
        a: "Use the demo request form on this page. An Aplus education specialist will reach out with pricing, a live demonstration and a rollout plan sized to your classrooms.",
      },
    ],
    ctaHeading: "See Class Saathi live in your school",
    ctaBody:
      "Tell us about your school and an Aplus education specialist will reach out with pricing, a live demonstration and a rollout plan.",
    ctaLabel: "Request a School Demo",
  },
  {
    slug: "coaching-institutes",
    navLabel: "Coaching Institutes",
    title: "Class Saathi for Coaching Institutes — Batch Assessment",
    subtitle: "AI quiz generation from your own material, with per-student and per-batch insight reports.",
    intro:
      "Coaching institutes run on batches, repetition and measurable results, and Class Saathi's teacher and student tools are built for exactly that: quizzes generated from an institute's own material, daily practice between sessions, and reports that show which students in a batch are actually keeping up.",
    leadStakeholder: "teacher",
    points: [
      {
        title: "AI quiz generation from your own content",
        detail:
          "Saathi AI generates quizzes from an institute's own learning-related URLs, documents or prompts, so batch assessments are built from the material already being taught rather than a generic bank.",
      },
      {
        title: "AI lesson plans aligned to your material",
        detail:
          "Teachers can create and customise AI-based lesson plans aligned with their own documents, keeping a coaching schedule consistent across multiple faculty or batches.",
      },
      {
        title: "Daily practice and self-paced tutoring between sessions",
        detail:
          "Students get daily quizzes and subject-centric quizzes for unlimited practice, plus Saathi Tutor, a personalised AI tutor for mastering concepts on their own time between classes.",
      },
      {
        title: "Insight reports per student and per batch",
        detail:
          "Downloadable AI-based insight reports cover each student and the entire class, so an institute can see which students in a batch need attention without manually grading every quiz.",
      },
      {
        title: "Built-in class kit for session management",
        detail:
          "A pie timer, spinner, dice, team maker, presenter and vote are built into the teacher app, covering the small session-management jobs a coaching class needs alongside assessment.",
      },
    ],
    faqs: [
      {
        q: "Can Class Saathi generate quizzes from our own question bank?",
        a: "Yes. Saathi AI generates quizzes from learning-related URLs, documents or prompts, so an institute's existing material and question bank can be turned into clicker-based quizzes rather than starting from a generic set.",
      },
      {
        q: "What does a batch's teacher see after a session?",
        a: "Teachers get AI-based insights as downloadable reports for each student and for the entire class, alongside the raw responses captured instantly during the session — enough to see which topics a batch struggled with before the next class.",
      },
      {
        q: "Do students need a device of their own in class?",
        a: "Students answer on their own Bluetooth clicker during class, which is a simpler device than a phone or tablet; outside class, the student app adds daily quizzes, subject-centric practice and Saathi Tutor for self-paced learning.",
      },
      {
        q: "How do we get pricing for our institute?",
        a: "Use the demo request form on this page. An Aplus education specialist will reach out within 1 business day with pricing, a live demonstration and a plan sized to your batches.",
      },
    ],
    ctaHeading: "Bring AI-powered batch assessment to your institute",
    ctaBody:
      "Tell us about your batches and an Aplus education specialist will reach out with pricing, a live demonstration and a rollout plan.",
    ctaLabel: "Request a Demo for Your Batches",
  },
  {
    slug: "clickers-vs-alternatives",
    navLabel: "Clickers vs Alternatives",
    title: "Clickers vs App Quizzing vs Interactive Panels in Class",
    subtitle: "Comparing hands-up, app quizzing, interactive panels and dedicated clickers on the things that actually differ.",
    intro:
      "Schools evaluating a classroom response system usually compare four approaches: hands-up or paper, phone or tablet app quizzing, an interactive panel at the front of the room, and a dedicated clicker per student. The right choice comes down to per-student cost, whether every student actually answers, internet dependency and how much setup a lesson needs.",
    leadStakeholder: null,
    points: [
      {
        title: "Hands-up and paper: no device cost, no real data",
        detail:
          "Hands-up costs nothing per student but only shows who volunteers, not who understands; paper quizzes capture every student's answer but only after manual grading, with no live picture during the lesson.",
      },
      {
        title: "Phone or tablet app quizzing: needs a device and a connection per student",
        detail:
          "App-based quizzing needs every student to have a phone or tablet plus a working classroom Wi-Fi connection, which raises both device cost and internet dependency, and introduces a general-purpose device as a distraction risk during the lesson.",
      },
      {
        title: "Interactive panel: one shared screen, not one response per student",
        detail:
          "An interactive panel at the front of the room is built for shared display and annotation, not for capturing an individual response from every student at their own seat — it solves a different classroom problem than a response system.",
      },
      {
        title: "Dedicated clicker: one simple device, no internet, no general-purpose screen",
        detail:
          "A dedicated per-student clicker like Class Saathi's connects over Bluetooth straight to the teacher's device, so a class runs with no internet required and no per-student screen to double as a distraction — the app itself lives on the teacher's device, not the student's.",
      },
      {
        title: "Setup time per lesson is where the difference shows up",
        detail:
          "Hands-up needs no setup; paper needs printing and later grading; app quizzing needs devices charged, connected and logged in before the lesson starts; a clicker system needs the receiver and clickers on hand, then runs the same way every time regardless of the school's internet.",
      },
    ],
    faqs: [
      {
        q: "Why use a dedicated clicker instead of students' own phones?",
        a: "A dedicated clicker is a single-purpose Bluetooth device with no browser, apps or notifications, so it removes the distraction risk a general-purpose phone or tablet carries into a lesson, and it doesn't depend on every student owning a compatible device or the classroom having working internet.",
      },
      {
        q: "Does an interactive panel replace a classroom response system?",
        a: "No — an interactive panel is a shared display and annotation surface at the front of the room. It doesn't capture an individual response from every student at their seat the way a per-student clicker or app does, so schools generally use the two for different jobs rather than as substitutes.",
      },
      {
        q: "What happens to a response system if the classroom has no internet?",
        a: "Systems built around Wi-Fi or a school network, such as most app-based quizzing, stop working reliably without a connection. A Bluetooth clicker system like Class Saathi runs the same way with no internet required, because clickers pair directly to the teacher's device.",
      },
      {
        q: "How should our school evaluate options for a classroom response system?",
        a: "Compare the four approaches on per-student device cost, whether every student answers every question, dependency on classroom internet, distraction risk, and setup time per lesson — then request a demo of the options you're considering so staff can judge the real classroom experience, not just a spec sheet.",
      },
    ],
    ctaHeading: "See a dedicated clicker system in action",
    ctaBody:
      "Tell us which options you're evaluating and an Aplus education specialist will reach out with pricing, a live demonstration and a rollout plan.",
    ctaLabel: "Request a Demo",
  },
];

export function getEducationSegment(slug: string): EducationSegment | undefined {
  return educationSegments.find((s) => s.slug === slug);
}
