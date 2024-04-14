import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { parseMarkdown } from "~/markdown.server";
import { Markdown } from "~/components/markdown";

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
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({
    title: video.title,
    description: video.description,
    summary: parseMarkdown(video.summary),
  }, { headers });
};

export default function Dashboard() {
  const loaderResponse = useLoaderData<typeof loader>();

  console.log("loaderResponse", loaderResponse);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        {loaderResponse.title}
      </h1>
      <p>{loaderResponse.description}</p>
      <div className="mx-auto max-w-sm">
        <Markdown content={loaderResponse.summary} />
      </div>
    </div>
  );
}
