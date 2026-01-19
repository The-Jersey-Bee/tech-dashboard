import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ICONS } from '../constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 text-center shadow-xl border border-gray-700">
            {/* Jersey Bee Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-900 p-4 rounded-full">
                <ICONS.Bee />
              </div>
            </div>

            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/10 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred in the Tech Hub. Our bees are working
              to fix it.
            </p>

            {/* Error Details (collapsed by default in production) */}
            {this.state.error && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-400 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Try Again Button */}
            <button
              onClick={this.handleReset}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Try Again
            </button>

            {/* Secondary Action */}
            <button
              onClick={() => window.location.reload()}
              className="mt-3 w-full bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white font-medium py-2 px-6 rounded-xl transition-all border border-gray-600"
            >
              Reload Page
            </button>

            {/* Footer */}
            <p className="mt-6 text-xs text-gray-500">
              Jersey Bee Tech Hub
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
