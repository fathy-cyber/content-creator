/**
 * ModuleLoader — Dynamic module loading utilities.
 * 
 * Provides React.lazy wrappers and loading boundaries 
 * for dynamically loading module components.
 */

import React, { Suspense, ComponentType } from 'react';

/**
 * Lazy-load a module component with a standardized loading boundary.
 */
export function lazyLoadModule(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  return React.lazy(importFn);
}

/**
 * Loading fallback component for module loading.
 */
export function ModuleLoadingFallback() {
  return React.createElement('div', {
    className: 'flex items-center justify-center min-h-[400px]',
  },
    React.createElement('div', {
      className: 'flex flex-col items-center gap-4',
    },
      React.createElement('div', {
        className: 'w-10 h-10 border-3 border-zinc-200 border-t-indigo-600 rounded-full animate-spin',
      }),
      React.createElement('p', {
        className: 'text-sm font-bold text-zinc-400 italic',
      }, 'Loading module...')
    )
  );
}

/**
 * Error fallback component for module loading failures.
 */
export function ModuleErrorFallback({ error, moduleId }: { error: Error; moduleId?: string }) {
  return React.createElement('div', {
    className: 'flex items-center justify-center min-h-[400px]',
  },
    React.createElement('div', {
      className: 'flex flex-col items-center gap-4 p-8 bg-rose-50 border border-rose-200 rounded-2xl max-w-md text-center',
    },
      React.createElement('div', {
        className: 'w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-2xl',
      }, '⚠️'),
      React.createElement('h3', {
        className: 'text-lg font-black text-rose-900',
      }, 'Module Loading Error'),
      React.createElement('p', {
        className: 'text-sm text-rose-600',
      }, moduleId ? `Failed to load module "${moduleId}"` : 'Failed to load module'),
      React.createElement('p', {
        className: 'text-xs text-rose-400 font-mono bg-rose-100 p-2 rounded-lg w-full break-all',
      }, error.message),
      React.createElement('button', {
        onClick: () => window.location.reload(),
        className: 'px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors',
      }, 'Reload Page')
    )
  );
}

/**
 * Wrap a lazy component with Suspense and error boundary.
 */
export function withModuleBoundary(
  LazyComponent: React.LazyExoticComponent<ComponentType<any>>,
  moduleId?: string
): ComponentType<any> {
  return function ModuleBoundary(props: any) {
    return React.createElement(
      ModuleErrorBoundary,
      { moduleId },
      React.createElement(
        Suspense,
        { fallback: React.createElement(ModuleLoadingFallback) },
        React.createElement(LazyComponent, props)
      )
    );
  };
}

/**
 * Simple error boundary for module components.
 */
class ModuleErrorBoundary extends React.Component<
  { children: React.ReactNode; moduleId?: string },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ModuleLoader] Error in module:`, error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return React.createElement(ModuleErrorFallback, {
        error: this.state.error,
        // @ts-ignore
        moduleId: this.props.moduleId,
      });
    }
    // @ts-ignore
    return this.props.children;
  }
}
