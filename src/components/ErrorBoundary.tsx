import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let displayMsg = error.message || "An unexpected error occurred.";
    try {
      const parsed = JSON.parse(displayMsg);
      if (parsed && parsed.error && parsed.operationType) {
        displayMsg = `Database ${parsed.operationType} error on "${parsed.path || "unknown"}": ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, message: displayMsg };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught application error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-lg text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Clinic System Error
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {this.state.message}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
