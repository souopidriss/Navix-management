import { Helmet } from 'react-helmet-async';
import { PageHeader } from '@/components/common';

const PlaceholderPage = ({ title, description = 'Ce module est en cours de développement.', icon = 'bi-cone-striped' }) => (
  <section className="container">
    <Helmet>
      <title>{title}</title>
    </Helmet>
    <PageHeader title={title} />
    <div className="card">
      <div className="card-body text-center py-5">
        <i className={`bi ${icon} display-4 text-secondary`} aria-hidden="true" />
        <p className="text-secondary mt-3 mb-0">{description}</p>
      </div>
    </div>
  </section>
);

export default PlaceholderPage;
