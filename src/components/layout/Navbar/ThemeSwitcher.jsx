import { useTheme } from '@/hooks';

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: 'bi-sun' },
  { value: 'dark', label: 'Sombre', icon: 'bi-moon-stars' },
  { value: 'system', label: 'Système', icon: 'bi-circle-half' },
];

const ThemeSwitcher = () => {
  const { mode, setMode } = useTheme();

  const handleSelect = (value) => {
    if (value === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    } else {
      setMode(value);
    }
  };

  return (
    <div className="dropdown">
      <button
        type="button"
        className="navix-topbar__icon-btn"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Changer de thème"
      >
        <i className={`bi ${mode === 'dark' ? 'bi-moon-stars' : 'bi-sun'}`} aria-hidden="true" />
      </button>

      <div className="dropdown-menu dropdown-menu-end navix-topbar__menu">
        <h6 className="dropdown-header">Thème</h6>
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="dropdown-item d-flex align-items-center gap-2"
            onClick={() => handleSelect(option.value)}
          >
            <i className={`bi ${option.icon}`} aria-hidden="true" />
            <span className="flex-grow-1">{option.label}</span>
            {mode === option.value && <i className="bi bi-check-lg" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
