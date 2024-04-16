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
    ...video,
    summary: video.summary ? parseMarkdown(video.summary) : "",
  }, { headers });
};

export default function Dashboard() {
  const loaderResponse = useLoaderData<typeof loader>();

  if (loaderResponse.current_state === "pending") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Fetching captions...</p>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16 mx-auto w-full max-w-screen-sm">
      <div className="prose">
        <h1
          dangerouslySetInnerHTML={{ __html: loaderResponse.title }}
          className="mb-4"
        />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-x-4">
        <p className="flex-auto py-0.5 text-sm leading-5 text-gray-500 flex flex-col items-center">
          <span>Creator</span>
          <span className="font-medium text-gray-900">{loaderResponse.author}</span>
        </p>
        <p className="flex-auto py-0.5 text-sm leading-5 text-gray-500 flex flex-col items-center">
          <span>Duration</span>
          <span className="font-medium text-gray-900">{loaderResponse.duration || "-"}</span>
        </p>
        <p className="flex-auto py-0.5 text-sm leading-5 text-gray-500 flex flex-col items-center">
          <span>Uploaded</span>
          <span className="font-medium text-gray-900">{loaderResponse.creation_date || "-"}</span>
        </p>
        <p className="flex-auto py-0.5 text-sm leading-5 text-gray-500 flex flex-col items-center">
          <span>YouTube</span>
          <a href={loaderResponse.youtube_url} target="_blank" className="inline-flex items-center gap-x-0.5">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.75 13.25L18 12C19.6569 10.3431 19.6569 7.65685 18 6V6C16.3431 4.34315 13.6569 4.34315 12 6L10.75 7.25" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.25 10.75L6 12C4.34315 13.6569 4.34315 16.3431 6 18V18C7.65685 19.6569 10.3431 19.6569 12 18L13.25 16.75" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.25 9.75L9.75 14.25" />
            </svg>
            <span className="font-medium text-gray-900 underline">Visit</span>
          </a>
        </p>
      </div>

      <div className="mt-8 prose">
        <Markdown content={loaderResponse.summary} />
      </div>
    </div>
  );
}
