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

// tag-hive.com homepage, verified 2026-07-19: "Trusted by 15,000+ classrooms globally".
export const educationTrustLine = "Trusted in 15,000+ classrooms globally";

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

// Brochure pp.4–8. Images extracted from the brochure (Task 4).
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
// AI draft were unverifiable and are replaced).
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
    // Brochure p.1/p.10 + tag-hive.com (verified 2026-07-19: founder is an
    // IIT Kanpur & Harvard graduate; "Built by a Harvard MBA").
    a: "TagHive is the education-technology company behind Class Saathi, operating in South Korea and India, and accelerated by Samsung C-Lab. Founded by an IIT Kanpur and Harvard alumnus, TagHive builds Class Saathi® — its clicker-based learning and assessment solution.",
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
