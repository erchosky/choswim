import React from 'react';

type State = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[app] Error no controlado', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-app-bg px-5 text-app-text">
        <section className="w-full max-w-md rounded-2xl border border-app-line bg-app-surface p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase text-app-danger">Error de la app</p>
          <h1 className="mt-2 text-2xl font-black">Algo se ha roto al cargar ChooseSwim.</h1>
          <p className="mt-3 text-sm leading-6 text-app-muted">
            La pantalla se ha protegido para evitar una página en blanco. Recarga la app y, si vuelve a pasar,
            revisa la consola para ver el detalle técnico.
          </p>
          <button
            className="mt-5 rounded-lg bg-app-accent px-4 py-3 text-sm font-bold text-app-bg transition hover:brightness-110"
            type="button"
            onClick={() => window.location.reload()}
          >
            Recargar ChooseSwim
          </button>
        </section>
      </main>
    );
  }
}
