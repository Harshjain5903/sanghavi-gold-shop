import React from 'react';

interface State {
  hasError: boolean;
}

/** Shows a friendly message instead of a blank white page if something on the page crashes. */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('Page crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6">Please reload the page. If it keeps happening, message us on WhatsApp.</p>
        <button
          onClick={() => window.location.assign('/')}
          className="bg-brand-black text-white px-6 py-3 rounded-full font-bold text-sm"
        >
          Go to the home page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
