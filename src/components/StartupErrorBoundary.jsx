import { Component } from 'react';

// Top-level error boundary. React unmounts the whole tree and leaves an empty
// white #root when a render/lifecycle error is uncaught. This boundary turns
// any such failure into a visible, diagnostic screen so the site is NEVER a
// blank page, and the real error message is shown instead of hiding it.
export default class StartupErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('PYLO Web: startup render crash', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      const message =
        this.state.error?.message || String(this.state.error);

      return (
        <div className="config-error">
          <div className="config-error__card">
            <p className="config-error__title">PYLO failed to start</p>
            <p className="config-error__message">
              Something went wrong while the page was initializing. The error
              was:
            </p>
            <pre
              className="config-error__list"
              role="alert"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '.8125rem',
                color: 'var(--error)',
              }}
            >
              {message}
            </pre>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={this.handleReload}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}