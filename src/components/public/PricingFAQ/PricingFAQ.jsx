import { useState } from 'react';
import './PricingFAQ.css';

const FAQ_ITEMS = [
  {
    id: 'faq-trial',
    question: "Qu'est-ce que l'essai gratuit ?",
    answer:
      "Chaque plan inclut 14 jours d'essai gratuit. Vous acc\u00e9dez \u00e0 toutes les fonctionnalit\u00e9s du plan choisi sans aucune restriction. Aucune carte bancaire n'est requise pour démarrer. \u00c0 la fin de l'essai, vous pouvez choisir de souscrire ou de passer \u00e0 une autre formule.",
  },
  {
    id: 'faq-switch',
    question: "Puis-je changer de plan ?",
    answer:
      "Oui, vous pouvez upgrader ou downgrader \u00e0 tout moment depuis votre tableau de bord. Le changement prend effet imm\u00e9diatement, et la facturation est ajust\u00e9e au prorata.",
  },
  {
    id: 'faq-yearly',
    question: "Comment fonctionne la facturation annuelle ?",
    answer:
      "L'engagement annuel vous permet de b\u00e9n\u00e9ficier de 2 mois gratuits par rapport \u00e0 la facturation mensuelle. Vous payez l'\u00e9quivalent de 10 mois et b\u00e9n\u00e9ficiez de 12 mois d'acc\u00e8s.",
  },
  {
    id: 'faq-setup',
    question: "Y a-t-il des frais d'installation ?",
    answer:
      "Non, il n'y a aucun frais d'installation ni de configuration. La plateforme est 100 % SaaS, accessible directement depuis votre navigateur. Un accompagnement \u00e0 la prise en main est inclus dans tous les plans.",
  },
  {
    id: 'faq-payment',
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les virements bancaires, Mobile Money (MTN MoMo, Orange Money) et les paiements par carte bancaire. Tous les paiements sont trait\u00e9s en FCFA (XAF).",
  },
  {
    id: 'faq-cancel',
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Oui, vous pouvez annuler \u00e0 tout moment depuis votre espace client. Votre acc\u00e8s reste actif jusqu'\u00e0 la fin de la p\u00e9riode de facturation en cours. Aucune p\u00e9nalit\u00e9 d'annulation n'est appliqu\u00e9e.",
  },
];

const PricingFAQ = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="nv-pfaq" aria-labelledby="pfaq-title">
      <div className="nv-container">
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-question-circle" aria-hidden="true" />
            QUESTIONS FR&Eacute;QUENTES
          </span>
          <h2 id="pfaq-title" className="nv-section-title">
            Vous avez des questions&nbsp;?
          </h2>
          <p className="nv-section-subtitle">
            Tout ce que vous devez savoir sur nos tarifs et notre plateforme.
          </p>
        </div>

        <div className="nv-pfaq__list" role="list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`nv-pfaq__item ${isOpen ? 'nv-pfaq__item--open' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  id={item.id}
                  className="nv-pfaq__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-panel`}
                  onClick={() => toggle(item.id)}
                >
                  <span className="nv-pfaq__question">{item.question}</span>
                  <i
                    className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} nv-pfaq__chevron`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`${item.id}-panel`}
                  role="region"
                  aria-labelledby={item.id}
                  className={`nv-pfaq__answer-wrap ${isOpen ? 'nv-pfaq__answer-wrap--open' : ''}`}
                  aria-hidden={!isOpen}
                >
                  <p className="nv-pfaq__answer">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
