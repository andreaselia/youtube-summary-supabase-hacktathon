import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

// TODO: replace `any` with the database type
type TypedSupabaseClient = SupabaseClient<any>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
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
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({}: LoaderFunctionArgs) => {
  return json({
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    },
  });
};

export default function App() {
  const { env } = useLoaderData<typeof loader>();
  const [supabase] = useState(() => createBrowserClient(
    env.SUPABASE_URL, env.SUPABASE_ANON_KEY
  ));

  return (
    <Outlet context={{ supabase }} />
  );
}
