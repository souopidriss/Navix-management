import { THEME_MODES } from '@/config';
import useThemeStore from '@/store/theme.store';

const THEME_OPTIONS = [
  { value: THEME_MODES.LIGHT, label: 'Clair', icon: 'bi-sun' },
  { value: THEME_MODES.DARK, label: 'Sombre', icon: 'bi-moon-stars' },
  { value: THEME_MODES.SYSTEM, label: 'Système', icon: 'bi-circle-half' },
];

const ThemeSwitcher = () => {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const toggleIcon =
    theme === THEME_MODES.SYSTEM
      ? 'bi-circle-half'
      : resolvedTheme === THEME_MODES.DARK
        ? 'bi-moon-stars'
        : 'bi-sun';

  return (
    <div className="dropdown">
      <button
        type="button"
        className="navix-topbar__icon-btn"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Changer de thème"
      >
        <i className={`bi ${toggleIcon}`} aria-hidden="true" />
      </button>

      <div className="dropdown-menu dropdown-menu-end navix-topbar__menu">
        <h6 className="dropdown-header">Thème</h6>
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="dropdown-item d-flex align-items-center gap-2"
            aria-pressed={theme === option.value}
            onClick={() => setTheme(option.value)}
          >
            <i className={`bi ${option.icon}`} aria-hidden="true" />
            <span className="flex-grow-1">{option.label}</span>
            {theme === option.value && <i className="bi bi-check-lg" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
