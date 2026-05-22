import type { Metadata } from "next";
import { solutions } from "@/data/solutions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const solution = solutions.find((s) => s.slug === industry);
  if (!solution) return {};

  const url = `https://www.aplustechsol.com/solutions/${industry}`;
  return {
    title: solution.title,
    description: solution.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${solution.title} | Aplus Technology Solutions`,
      description: solution.description,
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: solution.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: solution.title,
      description: solution.description,
    },
  };
}

export default function SolutionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
