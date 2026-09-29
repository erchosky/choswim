import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-app-accent text-xl font-black text-app-bg">CS</div>
          <h1 className="mt-4 text-3xl font-black text-app-text">ChooseSwim</h1>
          <p className="text-sm text-app-muted">Rankeds privados de natacion.</p>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
