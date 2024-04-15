import { LoaderFunctionArgs, redirect } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "HEAD" || request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
    });
  }

  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");

  console.log("tokenHash", tokenHash);

  if (tokenHash) {
    const { supabaseClient, headers } = createSupabaseServerClient(request);
    const { error } = await supabaseClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

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
