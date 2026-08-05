/**
 * Navix Billing — BillingCompanyInfo
 * --------------------------------------------------------------------------
 * Bloc d'identité d'une entreprise cliente sur une facture : raison sociale,
 * devise de facturation, adresse et contact. Utilisé dans le détail de
 * facture (émetteur / destinataire).
 */
import { getCurrency } from '../constants';
import './BillingCompanyInfo.css';

const InfoLine = ({ icon, label, children }) => (
  <div className="navix-billing-company__line">
    <i className={`bi ${icon} navix-billing-company__line-icon`} aria-hidden="true" />
    <span>
      <span className="navix-billing-company__line-label">{label}</span>
      <span className="navix-billing-company__line-value">{children}</span>
    </span>
  </div>
);

const BillingCompanyInfo = ({ company, currency, title = 'Émetteur' }) => {
  if (!company) return null;
  const currencyMeta = getCurrency(currency);

  return (
    <div className="navix-billing-company">
      <div className="navix-billing-company__head">
        <span className="navix-billing-company__badge" aria-hidden="true">
          <i className="bi bi-building" />
        </span>
        <div className="min-w-0">
          <span className="navix-billing-company__role">{title}</span>
          <h3 className="navix-billing-company__name mb-0">{company.name}</h3>
        </div>
      </div>
      <dl className="navix-billing-company__details mb-0">
        <InfoLine icon="bi-cash-stack" label="Devise">
          {currencyMeta.label}
        </InfoLine>
        {company.address && (
          <InfoLine icon="bi-geo-alt" label="Adresse">
            {company.address}
          </InfoLine>
        )}
        {company.email && (
          <InfoLine icon="bi-envelope" label="E-mail">
            {company.email}
          </InfoLine>
        )}
        {company.phone && (
          <InfoLine icon="bi-telephone" label="Téléphone">
            {company.phone}
          </InfoLine>
        )}
      </dl>
    </div>
  );
};

export default BillingCompanyInfo;
