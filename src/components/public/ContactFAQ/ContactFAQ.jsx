import { useState } from 'react';
import './ContactFAQ.css';

const FAQ_ITEMS = [
  {
    id: 'cf-demo',
    question: 'Comment demander une d\u00e9monstration\u00a0?',
    answer:
      "Utilisez le formulaire de contact en s\u00e9lectionnant le sujet \u00ab\u00a0Demande de d\u00e9monstration\u00a0\u00bb. Vous pouvez \u00e9galement d\u00e9crire bri\u00e8vement les besoins sp\u00e9cifiques de votre flotte dans le champ message.",
  },
  {
    id: 'cf-specific',
    question: 'Puis-je pr\u00e9senter les besoins sp\u00e9cifiques de ma flotte\u00a0?',
    answer:
      "Oui, le formulaire de contact vous permet de d\u00e9crire votre contexte, la taille de votre flotte et vos attentes. Notre \u00e9quipe pourra ainsi vous proposer une d\u00e9monstration adapt\u00e9e.",
  },
  {
    id: 'cf-small',
    question: 'Navix est-il adapt\u00e9 aux petites flottes\u00a0?',
    answer:
      "Oui, Navix Management est une solution \u00e9volutive con\u00e7ue pour s'adapter aussi bien aux petites flottes de d\u00e9but \u00e0 10 v\u00e9hicules qu'aux grandes flottes de plusieurs centaines de v\u00e9hicules.",
  },
  {
    id: 'cf-pricing',
    question: 'Puis-je obtenir plus d\u2019informations sur les tarifs\u00a0?',
    answer:
      "Oui, vous pouvez nous contacter via le formulaire ou consulter directement notre page Tarifs qui d\u00e9taille chaque plan et ses fonctionnalit\u00e9s.",
  },
];

const ContactFAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="nv-cfaq" aria-labelledby="cfaq-title">
      <div className="nv-container">
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-question-circle" aria-hidden="true" />
            QUESTIONS FR&Eacute;QUENTES
          </span>
          <h2 id="cfaq-title" className="nv-section-title">
            Besoin de r\u00e9ponses rapides\u00a0?
          </h2>
          <p className="nv-section-subtitle">
            Quelques r\u00e9ponses aux questions les plus fr\u00e9quentes sur notre plateforme.
          </p>
        </div>

        <div className="nv-cfaq__list" role="list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`nv-cfaq__item ${isOpen ? 'nv-cfaq__item--open' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  id={item.id}
                  className="nv-cfaq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-panel`}
                  onClick={() => toggle(item.id)}
                >
                  <span className="nv-cfaq__question">{item.question}</span>
                  <i
                    className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} nv-cfaq__chevron`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={item.id}
                  className={`nv-cfaq__answer-wrap ${isOpen ? 'nv-cfaq__answer-wrap--open' : ''}`}
                  aria-hidden={!isOpen}
                >
                  <p className="nv-cfaq__answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;
