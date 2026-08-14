/**
 * Navix Core — ErrorBoundary
 * --------------------------------------------------------------------------
 * Frontière d'erreur React réutilisable : intercepte les erreurs de rendu,
 * évite l'écran blanc et affiche une interface de repli avec réessai et
 * navigation vers une page sûre.
 *
 * Props :
 *   fallback : (error, { errorInfo, retry }) => ReactNode
 *              — rendu personnalisé en cas d'erreur (par défaut ErrorFallback)
 *   onError  : (error, errorInfo) => void — notification externe (ex. logging)
 *   resetKey : valeur déclenchant une remise à zéro automatique quand elle change
 *              (ex. pathname) — permet de « sortir » d'un état d'erreur à la
 *              navigation sans réessai manuel.
 *   children : sous-arbre protégé
 *
 * Les détails techniques (message / stack) ne sont jamais exposés en
 * production : uniquement en développement (import.meta.env.DEV).
 */
import { Component } from 'react';
import ErrorFallback from './ErrorFallback';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    const { resetKey } = this.props;
    if (this.state.hasError && resetKey !== undefined && resetKey !== prevProps.resetKey) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback(error, { errorInfo, retry: this.reset });
    }

    return <ErrorFallback error={error} onRetry={this.reset} />;
  }
}

export default ErrorBoundary;
