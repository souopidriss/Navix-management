import SectionReveal from '../SectionReveal';
import './VisionSection.css';

const VisionSection = () => (
  <section className="nv-section nv-section--alt" aria-labelledby="vision-title">
    <div className="nv-container">
      <div className="nv-vision">
        <SectionReveal>
          <div className="nv-vision__text">
            <span className="nv-badge">
              <i className="bi bi-eye" aria-hidden="true" />
              NOTRE VISION
            </span>
            <h2 id="vision-title" className="nv-section-title">
              Une gestion de flotte plus{' '}
              <span className="nv-vision__accent">intelligente</span>
            </h2>
            <p className="nv-section-subtitle nv-vision__subtitle">
              Nous croyons que la gestion des v&eacute;hicules, des chauffeurs
              et des op&eacute;rations peut &ecirc;tre plus{' '}
              <strong>centralis&eacute;e</strong>, plus{' '}
              <strong>structur&eacute;e</strong> et plus{' '}
              <strong>transparente</strong>. Navix Management a &eacute;t&eacute;
              con&ccedil;u pour offrir une vision claire de l&apos;ensemble des
              activit&eacute;s li&eacute;es &agrave; votre flotte.
            </p>
          </div>
        </SectionReveal>
        <SectionReveal delay={120}>
          <div className="nv-vision__visual" aria-hidden="true">
            <div className="nv-vision__mockup">
              <div className="nv-vision__mockup-bar">
                <span className="nv-vision__dot nv-vision__dot--red" />
                <span className="nv-vision__dot nv-vision__dot--yellow" />
                <span className="nv-vision__dot nv-vision__dot--green" />
              </div>
              <div className="nv-vision__mockup-body">
                <div className="nv-vision__mockup-row">
                  <div className="nv-vision__mockup-kpi">
                    <span className="nv-vision__mockup-label">Flotte</span>
                    <span className="nv-vision__mockup-value">Active</span>
                  </div>
                  <div className="nv-vision__mockup-kpi">
                    <span className="nv-vision__mockup-label">Missions</span>
                    <span className="nv-vision__mockup-value">En cours</span>
                  </div>
                </div>
                <div className="nv-vision__mockup-chart">
                  <div className="nv-vision__mockup-bar-fill" style={{ width: '70%' }} />
                  <div className="nv-vision__mockup-bar-fill" style={{ width: '50%' }} />
                  <div className="nv-vision__mockup-bar-fill" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </div>
  </section>
);

export default VisionSection;
