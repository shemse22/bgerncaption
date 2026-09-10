import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    } else {
      window.location.hash = '#/';
      window.location.reload();
    }
  };

  private handleClearAndReset = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected runtime error occurred.';
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {this.props.fallbackTitle || 'Something went wrong'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                ይቅርታ፣ ያልተጠበቀ ስህተት ተፈጥሯል። ገጹን እንደገና በማደስ ወይም ወደ ዋናው ገጽ በመመለስ ይቀጥሉ።
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-[11px] text-rose-300 break-all max-h-36 overflow-y-auto">
              {errorMessage}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                <RefreshCw className="w-4 h-4" /> Refresh Page (አድስ)
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Home className="w-4 h-4" /> Go to Home (ዋና ገጽ)
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="text-[11px] text-slate-500 hover:text-slate-400 inline-flex items-center gap-1.5 transition underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Temporary Session & Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
