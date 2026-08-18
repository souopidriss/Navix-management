import { Helmet } from 'react-helmet-async';
import FeaturesHero from '@/components/public/FeaturesHero';
import ModuleOverview from '@/components/public/ModuleOverview';
import VehicleSection from '@/components/public/VehicleSection';
import VehicleCategoriesGrid from '@/components/public/VehicleCategoriesGrid';
import DriverSection from '@/components/public/DriverSection';
import MissionSection from '@/components/public/MissionSection';
import MaintenanceSection from '@/components/public/MaintenanceSection';
import FuelSection from '@/components/public/FuelSection';
import TripSection from '@/components/public/TripSection';
import AlertSection from '@/components/public/AlertSection';
import AnalyticsSection from '@/components/public/AnalyticsSection';
import DocumentSection from '@/components/public/DocumentSection';
import SearchFilterSection from '@/components/public/SearchFilterSection';
import ReportsSection from '@/components/public/ReportsSection';
import FeaturesCta from '@/components/public/FeaturesCta';

const FeaturesPage = () => (
  <>
    <Helmet>
      <title>Fonctionnalit&eacute;s Navix Management &mdash; Gestion compl&egrave;te de flotte</title>
      <meta name="description" content="D&eacute;couvrez les fonctionnalit&eacute;s de Navix Management : gestion de v&eacute;hicules, chauffeurs, missions, maintenance, carburant, analytics et rapports pour votre flotte." />
      <meta property="og:title" content="Fonctionnalit&eacute;s Navix Management" />
      <meta property="og:description" content="Plateforme SaaS compl&egrave;te pour la gestion de flotte de v&eacute;hicules. V&eacute;hicules, chauffeurs, missions, maintenance, carburant et analytics." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://navixmanagement.com/fonctionnalites" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Fonctionnalit&eacute;s Navix Management" />
      <meta name="twitter:description" content="Gestion compl&egrave;te de flotte : v&eacute;hicules, chauffeurs, missions, maintenance et analytics." />
    </Helmet>

    <main>
      <FeaturesHero />
      <ModuleOverview />
      <VehicleSection />
      <VehicleCategoriesGrid />
      <DriverSection />
      <MissionSection />
      <MaintenanceSection />
      <FuelSection />
      <TripSection />
      <AlertSection />
      <AnalyticsSection />
      <DocumentSection />
      <SearchFilterSection />
      <ReportsSection />
      <FeaturesCta />
    </main>
  </>
);

export default FeaturesPage;
