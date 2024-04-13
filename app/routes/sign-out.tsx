import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    return redirect("/");
  }

  await supabaseClient.auth.signOut();

  return redirect("/", {
    headers,
  });
};
