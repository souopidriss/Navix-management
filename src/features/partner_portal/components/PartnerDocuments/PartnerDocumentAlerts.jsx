/**
 * Navix Partner Portal — PartnerDocumentAlerts (PROMPT 066)
 * --------------------------------------------------------------------------
 * Zone « Documents à surveiller » : documents expirant bientôt, déjà expirés
 * et en attente. Chaque alerte propose un lien « Voir les documents
 * concernés » qui positionne le filtre Statut correspondant sur la page.
 */
const PartnerDocumentAlerts = ({ counts = {}, onFilterStatus }) => {
  const items = [];

  if ((counts.expiring ?? 0) > 0) {
    items.push({
      key: 'expiring',
      severity: 'warning',
      icon: 'bi-clock-history',
      title: `${counts.expiring} document${counts.expiring > 1 ? 's' : ''} expirent bientôt`,
      description: 'Échéance sous 30 jours — anticipez le renouvellement de vos justificatifs.',
    });
  }
  if ((counts.expired ?? 0) > 0) {
    items.push({
      key: 'expired',
      severity: 'danger',
      icon: 'bi-x-octagon',
      title: `${counts.expired} document${counts.expired > 1 ? 's' : ''} déjà expiré${counts.expired > 1 ? 's' : ''}`,
      description: 'Ces justificatifs ne sont plus valides : renouvelez-les rapidement.',
    });
  }
  if ((counts.pending ?? 0) > 0) {
    items.push({
      key: 'pending',
      severity: 'info',
      icon: 'bi-hourglass-split',
      title: `${counts.pending} document${counts.pending > 1 ? 's' : ''} en attente`,
      description: 'En cours de traitement par l’équipe Navix Management.',
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="navix-pdoc-alerts mb-4" aria-label="Documents à surveiller">
      <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="bi bi-exclamation-triangle text-warning" aria-hidden="true" />
        Documents à surveiller
      </h2>
      <div className="row g-3">
        {items.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.key}>
            <div className={`navix-pdoc-alerts__item navix-pdoc-alerts__item--${item.severity}`}>
              <span className="navix-pdoc-alerts__icon" aria-hidden="true">
                <i className={`bi ${item.icon}`} />
              </span>
              <div className="flex-grow-1">
                <p className="fw-semibold mb-1">{item.title}</p>
                <p className="small text-secondary mb-2">{item.description}</p>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-decoration-none navix-pdoc-alerts__link"
                  onClick={() => onFilterStatus(item.key)}
                >
                  Voir les documents concernés <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnerDocumentAlerts;
