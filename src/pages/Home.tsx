import HeroSection from '../components/HeroSection';
import MissionVisionSection from '../components/MissionVisionSection';
import BYKSection from '../components/BYKSection';
import WorksPreviewSection from '../components/WorksPreviewSection';
import MembershipSection from '../components/MembershipSection';
import FAQSection from '../components/FAQSection';
import NewsletterSection from '../components/NewsletterSection';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <>
      <HeroSection />
      <section id="about">
        <MissionVisionSection />
      </section>
      <BYKSection />
      <WorksPreviewSection />
      <MembershipSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
