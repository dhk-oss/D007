import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { DataService } from '../services/dataService';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetCache = () => {
    try {
      DataService.resetAllStorage();
    } catch (e) {
      localStorage.clear();
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 max-w-[480px] mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft-lg text-center space-y-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-stone-800 tracking-tight">
                App Encountered an Issue
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                A temporary error or legacy cache mismatch occurred. You can reload or reset the app data cache to restore default settings.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-50 rounded-2xl text-left border border-stone-200/60 overflow-hidden">
                <p className="text-[11px] font-mono font-bold text-rose-600 truncate">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[9px] font-mono text-stone-400 mt-1 max-h-24 overflow-y-auto no-scrollbar whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-2xl bg-stone-800 text-white font-extrabold text-xs shadow-soft hover:bg-stone-900 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full py-3 rounded-2xl bg-pastel-coral text-white font-extrabold text-xs shadow-soft hover:bg-rose-500 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset App Cache & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
