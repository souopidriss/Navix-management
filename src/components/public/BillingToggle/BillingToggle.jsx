import './BillingToggle.css';

const BillingToggle = ({ interval, onToggle }) => (
  <div className="nv-btoggle" role="radiogroup" aria-label="Intervalle de facturation">
    <button
      type="button"
      role="radio"
      aria-checked={interval === 'monthly'}
      className={`nv-btoggle__btn ${interval === 'monthly' ? 'nv-btoggle__btn--active' : ''}`}
      onClick={() => onToggle('monthly')}
    >
      Mensuel
    </button>
    <button
      type="button"
      role="radio"
      aria-checked={interval === 'yearly'}
      className={`nv-btoggle__btn ${interval === 'yearly' ? 'nv-btoggle__btn--active' : ''}`}
      onClick={() => onToggle('yearly')}
    >
      Annuel
      <span className="nv-btoggle__save">-2 mois</span>
    </button>
  </div>
);

export default BillingToggle;
