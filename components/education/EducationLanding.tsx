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
