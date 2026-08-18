import SectionReveal from '../SectionReveal';
import './ProblemSection.css';

const PROBLEMS = [
  {
    icon: 'bi-files',
    title: 'Informations dispers\u00e9es',
    text: 'Donn\u00e9es \u00e9parpill\u00e9es entre fichiers, tableurs et applications multiples.',
  },
  {
    icon: 'bi-clipboard2-pulse',
    title: 'Suivi manuel',
    text: 'Processus manuels chronophages pour le suivi des v\u00e9hicules et missions.',
  },
  {
    icon: 'bi-tools',
    title: 'Entretien difficile \u00e0 suivre',
    text: 'Manque de visibilit\u00e9 sur les dates et l\u00e9tat des maintenances.',
  },
  {
    icon: 'bi-graph-up-arrow',
    title: 'Co\u00fbts opaques',
    text: 'Difficult\u00e9 \u00e0 comprendre et anticiper les d\u00e9penses de la flotte.',
  },
  {
    icon: 'bi-person-check',
    title: 'Affectations complexes',
    text: 'Attribution des v\u00e9hicules et chauffeurs souvent d\u00e9sorganis\u00e9e.',
  },
  {
    icon: 'bi-folder2-open',
    title: 'Documents \u00e0 centraliser',
    text: 'Contrats, papiers et justificatifs difficiles \u00e0 retrouver.',
  },
];

const ProblemSection = () => (
  <section className="nv-section" aria-labelledby="problem-title">
    <div className="nv-container">
      <SectionReveal>
        <div className="nv-section-header">
          <span className="nv-badge">
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            LE D&Eacute;FI
          </span>
          <h2 id="problem-title" className="nv-section-title">
            La gestion d&apos;une flotte ne devrait pas &ecirc;tre compliqu&eacute;e
          </h2>
          <p className="nv-section-subtitle">
            Les organisations font face &agrave; des d&eacute;fis quotidiens
            qui rendent la gestion de leur flotte plus difficile qu&apos;elle
            ne devrait l&apos;&ecirc;tre.
          </p>
        </div>
      </SectionReveal>

      <div className="nv-problems" role="list">
        {PROBLEMS.map((problem, idx) => (
          <SectionReveal key={problem.title} delay={idx * 80}>
            <div className="nv-problem" role="listitem">
              <div className="nv-problem__icon" aria-hidden="true">
                <i className={`bi ${problem.icon}`} />
              </div>
              <h3 className="nv-problem__title">{problem.title}</h3>
              <p className="nv-problem__text">{problem.text}</p>
            </div>
          </SectionReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
