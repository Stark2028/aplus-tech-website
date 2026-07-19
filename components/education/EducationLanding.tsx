import EducationHero from "./EducationHero";
import AwardsStrip from "./AwardsStrip";
import ParticipationComparison from "./ParticipationComparison";
import HowItWorks from "./HowItWorks";
import EcosystemTabs from "./EcosystemTabs";

export default function EducationLanding() {
  return (
    <main className="min-h-screen bg-white">
      <EducationHero />
      <AwardsStrip />
      <ParticipationComparison />
      <HowItWorks />
      <EcosystemTabs />
    </main>
  );
}
