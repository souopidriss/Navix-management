import './ContactInfo.css';

const CONTACT_ITEMS = [
  {
    icon: 'bi-envelope',
    label: 'Email',
    value: 'Disponible prochainement',
    isPlaceholder: true,
  },
  {
    icon: 'bi-telephone',
    label: 'T\u00e9l\u00e9phone',
    value: 'Disponible prochainement',
    isPlaceholder: true,
  },
  {
    icon: 'bi-geo-alt',
    label: 'Adresse',
    value: 'Informations \u00e0 venir',
    isPlaceholder: true,
  },
];

const ContactInfo = () => (
  <div className="nv-contact-info">
    <div className="nv-contact-info__card">
      <h2 className="nv-contact-info__title">
        Contactez Navix Management
      </h2>
      <p className="nv-contact-info__desc">
        Notre &eacute;quipe est disponible pour vous accompagner dans la
        gestion de votre flotte.
      </p>

      <ul className="nv-contact-info__list" role="list">
        {CONTACT_ITEMS.map((item) => (
          <li key={item.label} className="nv-contact-info__item">
            <span className="nv-contact-info__icon" aria-hidden="true">
              <i className={`bi ${item.icon}`} />
            </span>
            <div className="nv-contact-info__text">
              <span className="nv-contact-info__label">{item.label}</span>
              <span className="nv-contact-info__value">{item.value}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="nv-contact-info__note">
        <i className="bi bi-info-circle" aria-hidden="true" />
        <span>
          Les coordonn\u00e9es compl\u00e8tes seront disponibles prochainement.
        </span>
      </div>
    </div>
  </div>
);

export default ContactInfo;
