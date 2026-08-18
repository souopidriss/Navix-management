import './TopBar.css';

const TopBar = ({ email, phone }) => (
  <div className="nv-topbar" role="complementary" aria-label="Informations de contact">
    <div className="nv-container">
      <div className="nv-topbar__inner">
        <ul className="nv-topbar__contact">
          {phone && (
            <li className="nv-topbar__item nv-topbar__item--desktop">
              <i className="bi bi-telephone-fill" aria-hidden="true" />
              <a href={`tel:${phone}`}>{phone}</a>
            </li>
          )}
          {email && (
            <li className="nv-topbar__item">
              <i className="bi bi-envelope-fill" aria-hidden="true" />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
          )}
        </ul>
        <ul className="nv-topbar__social" aria-label="Réseaux sociaux">
          <li>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="bi bi-linkedin" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="bi bi-twitter-x" aria-hidden="true" />
            </a>
          </li>
          <li>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="bi bi-facebook" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default TopBar;
