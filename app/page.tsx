import Navigation from "@/components/Navigation"
import HeroSection from "@/components/HeroSection"
import FashionSingleSection from "@/components/FashionSingleSection"
import FashionCompareSection from "@/components/FashionCompareSection"
import ProfileRoastSection from "@/components/ProfileRoastSection"
import TypingTestSection from "@/components/TypingTestSection"
import RoastGauntletSection from "@/components/RoastGauntletSection"
import PersonalityDemolitionSection from "@/components/PersonalityDemolitionSection"
import Layout from "@/components/Layout"

export default function RoastMeDaddyPage() {
  return (
    <Layout currentPageName="Roast Me Daddy">
      <div className="bg-primary text-primary">
        <Navigation />
        <HeroSection />
        <FashionSingleSection />
        <FashionCompareSection />
        <ProfileRoastSection />
        <TypingTestSection />
        <RoastGauntletSection />
        <PersonalityDemolitionSection />
      </div>
    </Layout>
  )
}
