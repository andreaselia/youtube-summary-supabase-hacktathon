import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const formData = await request.formData();
  const videoId = formData.get("video_id");

  console.log(`Synthesizing video ${videoId}...`);

  await supabaseClient
    .from("videos")
    .update({ current_state: "synthesizing" })
    .eq("id", videoId);

  return redirect("/dashboard", {
    headers,
  });
};
