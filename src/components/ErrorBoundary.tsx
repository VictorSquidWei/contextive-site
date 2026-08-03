import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Top-level error boundary. If any render throws, show a minimal on-brand fallback
 * instead of a blank white screen — important for a page taking paid ad traffic.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaces in Vercel runtime logs / the browser console for debugging.
    console.error('[contextive] render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-rule bg-canvas p-8 space-y-4 text-center">
          <div className="small-caps text-muted">Contextive</div>
          <h1 className="font-display font-bold text-2xl leading-tight">Something went wrong.</h1>
          <p className="text-sm text-muted leading-relaxed">
            This page hit an unexpected error. Reload, or head back to the front page.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 small-caps border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
            >
              Go home
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 small-caps text-muted hover:text-ink transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      </main>
    );
  }
}
