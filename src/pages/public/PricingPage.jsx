import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PublicPage from './PublicPage';
import PricingHero from '@/components/public/PricingHero';
import BillingToggle from '@/components/public/BillingToggle';
import PricingCards from '@/components/public/PricingCards';
import FeatureComparison from '@/components/public/FeatureComparison';
import PricingFAQ from '@/components/public/PricingFAQ';
import PricingCTA from '@/components/public/PricingCTA';
import SectionReveal from '@/components/public/SectionReveal';
import './PricingPage.css';

const PricingPage = () => {
  const [billingInterval, setBillingInterval] = useState('monthly');

  return (
    <PublicPage title="Tarifs">
      <Helmet>
        <meta name="description" content="Tarifs Navix Management : plans Starter, Business, Professional et Enterprise pour la gestion de flotte. Essai gratuit de 14 jours." />
        <meta property="og:title" content="Tarifs — Navix Management" />
        <meta property="og:description" content="Choisissez la formule adaptée à votre flotte. Plans à partir de 19 000 FCFA/mois." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://navixmanagement.com/tarifs" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tarifs — Navix Management" />
        <meta name="twitter:description" content="Plans de gestion de flotte à partir de 19 000 FCFA/mois. Essai gratuit de 14 jours." />
      </Helmet>

      <main>
        <PricingHero />

      <section className="nv-section" aria-labelledby="pricing-toggle">
        <div className="nv-container">
          <h2 id="pricing-toggle" className="sr-only">Choix du plan</h2>

          <SectionReveal>
            <div className="nv-pcards-toggle">
              <BillingToggle
                interval={billingInterval}
                onToggle={setBillingInterval}
              />
            </div>
          </SectionReveal>

          <SectionReveal delay={100}>
            <PricingCards interval={billingInterval} />
          </SectionReveal>
        </div>
      </section>

      <SectionReveal>
        <FeatureComparison />
      </SectionReveal>

      <SectionReveal>
        <PricingFAQ />
      </SectionReveal>

      <SectionReveal>
        <PricingCTA />
      </SectionReveal>
      </main>
    </PublicPage>
  );
};

export default PricingPage;
