import { useState } from 'react';
import { Avatar } from '@/components/ui';

const COMPANIES = [
  { id: 1, name: 'Navix Trans', city: 'Douala' },
  { id: 2, name: 'Cameroon Express', city: 'Yaoundé' },
  { id: 3, name: 'LogiSud', city: 'Ebolowa' },
];

const CompanySwitcher = ({ className }) => {
  const [activeId, setActiveId] = useState(COMPANIES[0].id);
  const active = COMPANIES.find((company) => company.id === activeId) || COMPANIES[0];

  return (
    <div className={`dropdown ${className || ''}`.trim()}>
      <button
        type="button"
        className="navix-topbar__company"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Changer d'entreprise"
      >
        <Avatar icon="bi-buildings" size="sm" />
        <span className="navix-topbar__company-meta d-none d-lg-block">
          <span className="navix-topbar__company-name">{active.name}</span>
        </span>
        <i className="bi bi-chevron-down d-none d-lg-inline navix-topbar__company-caret" aria-hidden="true" />
      </button>

      <div className="dropdown-menu dropdown-menu-end navix-topbar__company-menu">
        <h6 className="dropdown-header">Entreprises</h6>
        {COMPANIES.map((company) => (
          <button
            key={company.id}
            type="button"
            className={`dropdown-item d-flex align-items-center ${company.id === activeId ? 'active' : ''}`.trim()}
            onClick={() => setActiveId(company.id)}
          >
            <Avatar name={company.name} size="xs" />
            <span className="flex-grow-1 ms-2">
              <span className="d-block">{company.name}</span>
              <span className="d-block small text-secondary">{company.city}</span>
            </span>
            {company.id === activeId && <i className="bi bi-check-lg" aria-hidden="true" />}
          </button>
        ))}
        <hr className="dropdown-divider" />
        <button type="button" className="dropdown-item">
          <i className="bi bi-plus-lg me-2" aria-hidden="true" />
          Ajouter une entreprise
        </button>
      </div>
    </div>
  );
};

export default CompanySwitcher;
