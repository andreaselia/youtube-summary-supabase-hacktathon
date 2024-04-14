import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: video, error } = await supabaseClient.from("videos")
    .select("*")
    .eq("id", params.video)
    .single();

  if (error) {
    return json({}, { headers });
  }

  return json(video, { headers });
};

export default function Dashboard() {
  const loaderResponse = useLoaderData<typeof loader>();

  console.log("loaderResponse", loaderResponse);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Video: {loaderResponse.id}
      </h1>
      <div className="mx-auto max-w-sm">
        {loaderResponse.captions}
      </div>
    </div>
  );
}
