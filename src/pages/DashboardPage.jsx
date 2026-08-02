import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/layout';

const DashboardPage = () => (
  <>
    <Helmet>
      <title>Dashboard</title>
    </Helmet>
    <PageHeader
      title="Dashboard"
      subtitle="Vue d'ensemble de votre flotte de véhicules."
      icon="bi-speedometer2"
    />
    <div className="card">
      <div className="card-body text-center py-5">
        <i className="bi bi-speedometer2 display-4 text-secondary" aria-hidden="true" />
        <p className="text-secondary mt-3 mb-0">Le tableau de bord de gestion de flotte sera développé ici.</p>
      </div>
    </div>
  </>
);

export default DashboardPage;
