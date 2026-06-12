import { AboutSections } from "@/components/site/about-sections";
import { PageHero } from "@/components/site/page-hero";

export default function AboutPage() {
  return (
    <>
      <PageHero title="About us" />
      <AboutSections />
    </>
  );
}
