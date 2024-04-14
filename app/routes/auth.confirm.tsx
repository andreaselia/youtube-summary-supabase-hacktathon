import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log("code", code);

  if (code) {
    const { supabaseClient, headers } = createSupabaseServerClient(request);
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

    console.log("error", error);

    if (error) {
      return redirect("/sign-in");
    }

    return redirect("/dashboard", {
      headers,
    });
  }

  return new Response("Authentication failed", {
    status: 400,
  });
};
