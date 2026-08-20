import { Helmet } from 'react-helmet-async';
import { HeroSection, HeroFeatureCards, FleetShowcase, HomePreviewSection, CTASection } from '@/components/public';

const HomePage = () => (
  <>
    <Helmet>
      <title>Navix Management — Gestion intelligente de flotte de v&eacute;hicules</title>
      <meta name="description" content="Navix Management est la solution SaaS professionnelle pour g&eacute;rer vos v&eacute;hicules, chauffeurs, maintenance et carburant en temps r&eacute;el." />
      <meta property="og:title" content="Navix Management — Gestion intelligente de flotte" />
      <meta property="og:description" content="Solution SaaS compl&egrave;te pour la gestion de flotte de v&eacute;hicules. Contr&ocirc;lez vos v&eacute;hicules, chauffeurs, entretiens et co&ucirc;ts." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Navix Management — Gestion intelligente de flotte" />
      <meta name="twitter:description" content="Solution SaaS professionnelle pour la gestion de flotte de v&eacute;hicules." />
    </Helmet>

    <main>
      <HeroSection />
      <HeroFeatureCards />
      <FleetShowcase />
      <HomePreviewSection />
      <CTASection />
    </main>
  </>
);

export default HomePage;
