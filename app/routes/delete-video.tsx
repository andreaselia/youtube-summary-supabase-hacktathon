import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const form = await request.formData();
  const videoId = form.get("video_id");

  const { error } = await supabaseClient.from("videos").delete().eq("id", videoId);

  if (error) {
    return redirect("/dashboard", {
      headers,
    });
  }

  return redirect("/dashboard", {
    headers,
  });
};
