import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { hydrate } from "./store/authSlice";
import { mapApiRoleToUserRole, mapApiCustomerType } from "~/types/auth";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Bootstrap auth from localStorage
  const Bootstrap = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
      try {
        const token = localStorage.getItem('authToken');
        const rawUser = localStorage.getItem('authUser');
        let user: any = null;
        if (rawUser) {
          try { user = JSON.parse(rawUser); } catch {}
        }
        if (token || user) {
          // Normalize minimal user fields if available
          const normalizedUser = user ? {
            id: user.id,
            name: user.full_name || user.name || '',
            email: user.email || user.phone || '',
            role: mapApiRoleToUserRole(user.role),
            customerType: mapApiCustomerType(user.customerType),
            branch_id: user.branch_id || null,
          } : null;
          dispatch(hydrate({ token: token || null, user: normalizedUser }));
        } else {
          dispatch(hydrate({ token: null, user: null }));
        }
      } catch {
        dispatch(hydrate({ token: null, user: null }));
      }
    }, [dispatch]);
    return null;
  };
  return (
    <Provider store={store}>
      <Bootstrap />
      <Outlet />
    </Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}