import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  error?: Error;
}

// Catches render-time errors anywhere in the tree and shows a graceful
// fallback instead of a blank screen. The user can reload to recover.
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '460px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(220,38,38,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <AlertTriangle size={40} color="#dc2626" />
          </div>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#dc2626', fontWeight: 600, marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
            Something went wrong
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1rem' }}>
            <em>Unexpected error</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 2rem', fontFamily: "'DM Sans', sans-serif" }}>
            We're sorry — an unexpected error occurred. Try reloading the page. If the problem persists, contact support.
          </p>
          <button
            onClick={this.handleReload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <RefreshCw size={17} /> Reload page
          </button>
        </div>
      </div>
    );
  }
}
