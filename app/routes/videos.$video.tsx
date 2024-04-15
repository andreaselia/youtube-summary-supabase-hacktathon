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
    summary: video.summary ? parseMarkdown(video.summary) : "",
    is_complete: video.is_complete,
    video_url: video.video_url,
  }, { headers });
};

export default function Dashboard() {
  const loaderResponse = useLoaderData<typeof loader>();

  console.log("loaderResponse", loaderResponse);

  if (!loaderResponse.is_complete) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Fetching captions...</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto w-full max-w-screen-lg prose">
        <h1>{loaderResponse.title}</h1>
        <p>{loaderResponse.description}</p>
        <a href={loaderResponse.video_url} className="text-slate-800">View Video</a>
      </div>
      <div className="mt-6 mx-auto w-full max-w-screen-md prose">
        <Markdown content={loaderResponse.summary} />
      </div>
    </div>
  );
}
