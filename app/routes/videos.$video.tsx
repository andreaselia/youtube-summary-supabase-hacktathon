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
    summary: video.summary ? parseMarkdown(video.summary) : "",
    is_complete: video.is_complete,
    video_url: video.video_url,
  }, { headers });
};

export default function Dashboard() {
  const loaderResponse = useLoaderData<typeof loader>();

  if (!loaderResponse.is_complete) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Fetching captions...</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16 mx-auto w-full max-w-screen-sm prose">
      <h1
        dangerouslySetInnerHTML={{ __html: loaderResponse.title }}
        className="mb-4"
      />

      <a
        href={loaderResponse.video_url}
        className="text-gray-800 text-sm inline-flex items-center gap-x-1.5"
        target="_blank"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
          <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
        </svg>
        View Video
      </a>

      <div className="mt-6">
        <Markdown content={loaderResponse.summary} />
      </div>
    </div>
  );
}
