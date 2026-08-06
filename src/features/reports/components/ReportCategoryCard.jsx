/**
 * Navix Reports — ReportCategoryCard
 * --------------------------------------------------------------------------
 * Carte de catégorie de rapport (hub) : icône, libellé, description,
 * permission requise et action « Ouvrir ».
 *
 * Props :
 *   category : méta d'une catégorie (getReportType) — { label, description,
 *              icon, variant, permission, route }
 *   onOpen   : () => void — navigation vers le rapport
 */
import { Card, Button } from '@/components/ui';
import './ReportComponents.css';

const ReportCategoryCard = ({ category, onOpen }) => {
  const { label, description, icon, variant = 'secondary', permission } = category;

  return (
    <Card hoverable className="h-100">
      <div className="d-flex gap-3">
        <span className={`navix-report-category__icon navix-report-category__icon--${variant}`} aria-hidden="true">
          <i className={`bi ${icon}`} />
        </span>
        <div className="flex-grow-1 min-width-0">
          <h5 className="mb-1">{label}</h5>
          <p className="mb-0 small text-secondary">{description}</p>
        </div>
      </div>
      <div className="navix-report-category__footer">
        <span className="navix-report-category__permission">
          <i className="bi bi-shield-lock" aria-hidden="true" />
          {permission}
        </span>
        <Button size="sm" variant="outline" icon="bi-box-arrow-up-right" onClick={onOpen}>
          Ouvrir
        </Button>
      </div>
    </Card>
  );
};

export default ReportCategoryCard;
