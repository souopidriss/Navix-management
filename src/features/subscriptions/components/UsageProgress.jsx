/**
 * Navix Subscriptions — UsageProgress
 * --------------------------------------------------------------------------
 * Barre de progression d'une ressource d'utilisation : libellé, consommation
 * (utilisé / limite), niveau (normal / attention / critique) et pourcentage.
 * Accessible via role="progressbar" et aria-*.
 */
import './UsageProgress.css';

const UsageProgress = ({ label, icon, used = 0, limit, ratio, level }) => {
  const hasLimit = Number.isFinite(Number(limit)) && Number(limit) > 0;
  const percent = hasLimit ? Math.round((Number(ratio) || 0) * 100) : null;
  const barWidth = hasLimit ? Math.min(percent, 100) : 0;
  const variant = level?.variant || 'success';

  return (
    <div className="navix-usage-progress">
      <div className="navix-usage-progress__head">
        <span className="navix-usage-progress__label">
          {icon && <i className={`bi ${icon} me-2`} aria-hidden="true" />}
          {label}
        </span>
        <span className="navix-usage-progress__values">
          {used.toLocaleString('fr-FR')} /{' '}
          {hasLimit ? Number(limit).toLocaleString('fr-FR') : 'Illimité'}
        </span>
      </div>

      <div
        className={`progress navix-usage-progress__bar ${hasLimit ? '' : 'navix-usage-progress__bar--unlimited'}`}
        role="progressbar"
        aria-valuenow={hasLimit ? barWidth : 0}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${label} : ${hasLimit ? `${percent} % utilisé` : 'illimité'}`}
      >
        <div
          className={`progress-bar bg-${variant} ${percent >= 100 ? 'navix-usage-progress__bar--full' : ''}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="navix-usage-progress__foot">
        <span className={`navix-usage-progress__level navix-usage-progress__level--${variant}`}>
          <i className={`bi ${level?.icon || 'bi-check-circle'} me-1`} aria-hidden="true" />
          {level?.label || 'Normal'}
        </span>
        {hasLimit && (
          <span className="navix-usage-progress__percent">{percent} %</span>
        )}
      </div>
    </div>
  );
};

export default UsageProgress;
