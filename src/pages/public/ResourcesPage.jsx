import { Helmet } from 'react-helmet-async';
import ResourcesHero from '@/components/public/ResourcesHero';
import ResourcesComingSoon from '@/components/public/ResourcesComingSoon';
import ContactCTA from '@/components/public/ContactCTA';

const ResourcesPage = () => (
  <>
    <Helmet>
      <title>Ressources Navix Management — Gestion de flotte</title>
      <meta
        name="description"
        content="Guides, articles et documentation pour optimiser la gestion de votre flotte avec Navix Management."
      />
      <meta property="og:title" content="Ressources — Navix Management" />
      <meta property="og:description" content="Guides, articles et documentation pour optimiser la gestion de votre flotte." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com/ressources" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Ressources — Navix Management" />
      <meta name="twitter:description" content="Guides, articles et documentation pour la gestion de flotte." />
    </Helmet>
    <main>
      <ResourcesHero />
      <ResourcesComingSoon />
      <ContactCTA />
    </main>
  </>
);

export default ResourcesPage;
