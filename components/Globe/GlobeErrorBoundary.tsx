"use client";

import { Component, ReactNode } from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class GlobeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("Globe error boundary:", error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="max-w-md rounded-lg border border-red-400/30 bg-red-500/5 p-6 text-center backdrop-blur-xl">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300/85">
              Render error
            </div>
            <h2 className="mt-2 text-lg font-semibold text-cyan-50">
              Globe could not initialize
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-cyan-100/65">
              The 3D scene hit an error. This is usually a shader or GPU compatibility
              issue. Try reloading the page or switching browsers.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 overflow-x-auto rounded border border-red-400/20 bg-black/40 px-2 py-1 text-left font-mono text-[10px] text-red-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded border border-cyan-400/40 bg-cyan-400/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-100 hover:bg-cyan-400/25"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
