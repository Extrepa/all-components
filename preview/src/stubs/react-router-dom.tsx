import React from 'react';

export function createBrowserRouter(routes: Array<{ element?: React.ReactNode }>) {
  return { routes };
}

export function RouterProvider({ router }: { router: { routes?: Array<{ element?: React.ReactNode }> } }) {
  const element = router?.routes?.[0]?.element ?? null;
  return <>{element}</>;
}

export function Navigate() {
  return null;
}

export function useNavigate() {
  return () => {};
}

export function useLoaderData<T = unknown>() {
  return null as T;
}
