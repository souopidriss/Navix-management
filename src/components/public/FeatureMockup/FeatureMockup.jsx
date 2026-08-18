import './FeatureMockup.css';

const FeatureMockup = ({ children, className = '', label = 'app.navix.management' }) => (
  <div className={`nv-fmockup ${className}`} role="img" aria-label={`Aperçu de l\u2019interface Navix Management \u2014 ${label}`}>
    <div className="nv-fmockup__window">
      <div className="nv-fmockup__toolbar">
        <span className="nv-fmockup__dot nv-fmockup__dot--red" />
        <span className="nv-fmockup__dot nv-fmockup__dot--yellow" />
        <span className="nv-fmockup__dot nv-fmockup__dot--green" />
        <span className="nv-fmockup__url">{label}</span>
      </div>
      <div className="nv-fmockup__body">
        {children}
      </div>
    </div>
  </div>
);

export default FeatureMockup;
