import { Helmet } from 'react-helmet-async';
import ContactHero from '@/components/public/ContactHero';
import ContactLayout from '@/components/public/ContactLayout';
import ContactFAQ from '@/components/public/ContactFAQ';
import ContactCTA from '@/components/public/ContactCTA';

const ContactPage = () => (
  <>
    <Helmet>
      <title>Contact Navix Management — Gestion de flotte</title>
      <meta
        name="description"
        content="Contactez Navix Management pour découvrir la plateforme et discuter de vos besoins."
      />
      <meta property="og:title" content="Contact — Navix Management" />
      <meta property="og:description" content="Contactez Navix Management pour découvrir la plateforme et discuter de vos besoins." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com/contact" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Contact — Navix Management" />
      <meta name="twitter:description" content="Contactez Navix Management pour découvrir la plateforme." />
    </Helmet>
    <main>
      <ContactHero />
      <ContactLayout />
      <ContactFAQ />
      <ContactCTA />
    </main>
  </>
);

export default ContactPage;
