import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './SearchFilterSection.css';

const FILTERS = [
  { label: 'Statut', value: 'Tous les statuts', icon: 'bi-funnel' },
  { label: 'P\u00e9riode', value: 'Ce mois-ci', icon: 'bi-calendar' },
  { label: 'Cat\u00e9gorie', value: 'Toutes', icon: 'bi-tag' },
];

const SEARCH_RESULTS = [
  { name: 'Toyota Hilux 2024', ref: 'LT 1234 AB', type: 'V\u00e9hicule' },
  { name: 'Jean Kamga', ref: 'CHA-089', type: 'Chauffeur' },
  { name: 'Mission Douala-Yaound\u00e9', ref: 'MSN-247', type: 'Mission' },
];

const CAPACITIES = [
  { icon: 'bi-search', label: 'Recherche instantan\u00e9e', desc: 'Trouvez n\u2019importe quel \u00e9l\u00e9ment en quelques secondes' },
  { icon: 'bi-funnel', label: 'Filtres avanc\u00e9s', desc: '5 types de filtres : s\u00e9lecteur, texte, date, multi, case' },
  { icon: 'bi-sort-alpha-down', label: 'Tri interactif', desc: 'Colonne cliquable, ordre croissant/d\u00e9croissant' },
  { icon: 'bi-download', label: 'Export', desc: 'CSV, JSON, Excel, PDF en un clic' },
];

const SearchFilterSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="search-title">
    <div className="nv-container">
      <div className="nv-split">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-search" aria-hidden="true" />
              Recherche &amp; Filtres
            </span>
            <h2 id="search-title" className="nv-section-title">
              Trouvez l&rsquo;information en quelques secondes
            </h2>
            <p className="nv-section-subtitle">
              Recherche instantan\u00e9e, filtres multiples, tri par colonne
              et export en un clic. Chaque donn&eacute;e est accessible en un instant.
            </p>
            <div className="nv-feat-list">
              {CAPACITIES.map((c) => (
                <div key={c.label} className="nv-feat-list__item">
                  <div className="nv-feat-list__icon">
                    <i className={`bi ${c.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <strong className="nv-feat-list__label">{c.label}</strong>
                    <span className="nv-feat-list__desc">{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={120}>
          <FeatureMockup label="app.navix.management/search">
            <div className="nv-search-mock">
              <div className="nv-search-mock__input">
                <i className="bi bi-search" aria-hidden="true" />
                <span>Rechercher un v&eacute;hicule, chauffeur, mission...</span>
              </div>
              <div className="nv-search-mock__filters">
                {FILTERS.map((f) => (
                  <div key={f.label} className="nv-search-mock__filter">
                    <i className={`bi ${f.icon}`} aria-hidden="true" />
                    <span>{f.label}: {f.value}</span>
                  </div>
                ))}
              </div>
              <div className="nv-search-mock__results">
                {SEARCH_RESULTS.map((r) => (
                  <div key={r.ref} className="nv-search-mock__result">
                    <span className="nv-search-mock__type">{r.type}</span>
                    <span className="nv-search-mock__name">{r.name}</span>
                    <span className="nv-search-mock__ref">{r.ref}</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default SearchFilterSection;
