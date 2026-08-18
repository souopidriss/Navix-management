import { Helmet } from 'react-helmet-async';
import PublicPage from './PublicPage';
import AboutHero from '@/components/public/AboutHero';
import VisionSection from '@/components/public/VisionSection';
import ProblemSection from '@/components/public/ProblemSection';
import ApproachSection from '@/components/public/ApproachSection';
import PlatformSection from '@/components/public/PlatformSection';
import RolesEcosystem from '@/components/public/RolesEcosystem';
import ValuesSection from '@/components/public/ValuesSection';
import TechnologySection from '@/components/public/TechnologySection';
import TrustSection from '@/components/public/TrustSection';
import MultiTenantSection from '@/components/public/MultiTenantSection';
import AboutCTA from '@/components/public/AboutCTA';

const AboutPage = () => (
  <PublicPage title="&Agrave; propos">
    <Helmet>
      <meta name="description" content="&Agrave; propos de Navix Management — Plateforme SaaS de gestion de flotte de v&eacute;hicules. D&eacute;couvrez notre vision et notre approche." />
      <meta property="og:title" content="&Agrave; propos — Navix Management" />
      <meta property="og:description" content="Navix Management est une plateforme SaaS pens&eacute;e pour centraliser et simplifier la gestion de flotte." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com/a-propos" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="À propos — Navix Management" />
      <meta name="twitter:description" content="Découvrez la vision et l'approche de Navix Management pour la gestion de flotte." />
    </Helmet>

    <main>
      <AboutHero />
      <VisionSection />
      <ProblemSection />
      <ApproachSection />
      <PlatformSection />
      <RolesEcosystem />
      <ValuesSection />
      <TechnologySection />
      <TrustSection />
      <MultiTenantSection />
      <AboutCTA />
    </main>
  </PublicPage>
);

export default AboutPage;
