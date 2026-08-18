import FeatureMockup from '../FeatureMockup';
import SectionReveal from '../SectionReveal';
import './DocumentSection.css';

const DOCS = [
  { icon: 'bi-file-earmark-pdf', label: 'Carte grise NVX-042', type: 'PDF', date: '12 janv. 2026', color: 'var(--navix-danger, #f0484d)' },
  { icon: 'bi-file-earmark-image', label: 'Photo permis Kamga', type: 'JPG', date: '05 mars 2026', color: 'var(--nv-success, #3fcb8f)' },
  { icon: 'bi-file-earmark-word', label: 'Contrat Mission #247', type: 'DOCX', date: '20 juil. 2026', color: 'var(--nv-blue-light)' },
  { icon: 'bi-file-earmark-pdf', label: 'Assurance Sprinter', type: 'PDF', date: '01 ao\u00fbt 2026', color: 'var(--navix-danger, #f0484d)' },
  { icon: 'bi-file-earmark-excel', label: 'Rapport carburant juil.', type: 'XLSX', date: '31 juil. 2026', color: 'var(--nv-success, #3fcb8f)' },
];

const CAPACITIES = [
  { icon: 'bi-folder2-open', label: 'Centralisation', desc: 'Tous les documents au m\u00eame endroit' },
  { icon: 'bi-tags', label: 'Cat\u00e9gorisation', desc: 'Par v\u00e9hicule, chauffeur, contrat, type' },
  { icon: 'bi-cloud-upload', label: 'Upload simplifi\u00e9', desc: '12 formats support\u00e9s, jusqu\u2019\u00e0 50 Mo' },
  { icon: 'bi-eye', label: 'Visibilit\u00e9', desc: 'Public, Priv\u00e9 ou Restreint' },
];

const DocumentSection = () => (
  <section className="nv-section" aria-labelledby="doc-title">
    <div className="nv-container">
      <div className="nv-split nv-split--reverse">
        <SectionReveal>
          <div className="nv-split__text">
            <span className="nv-badge">
              <i className="bi bi-folder2-open" aria-hidden="true" />
              Documents
            </span>
            <h2 id="doc-title" className="nv-section-title">
              Tous vos documents au m&ecirc;me endroit
            </h2>
            <p className="nv-section-subtitle">
              Cartes grises, permis de conduire, contrats, assurances, factures &mdash;
              uploadez, cat&eacute;gorisez et retrouvez chaque document en un clic.
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
          <FeatureMockup label="app.navix.management/documents">
            <div className="nv-doc-mock">
              {DOCS.map((d) => (
                <div key={d.label} className="nv-doc-mock__row">
                  <div className="nv-doc-mock__icon" style={{ color: d.color }}>
                    <i className={`bi ${d.icon}`} aria-hidden="true" />
                  </div>
                  <div className="nv-doc-mock__info">
                    <span className="nv-doc-mock__name">{d.label}</span>
                    <span className="nv-doc-mock__date">{d.date}</span>
                  </div>
                  <span className="nv-doc-mock__type">{d.type}</span>
                </div>
              ))}
            </div>
          </FeatureMockup>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default DocumentSection;
