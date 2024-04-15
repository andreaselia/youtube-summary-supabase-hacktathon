import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createSupabaseServerClient } from "~/supabase.server";

type Video = {
  id: string;
  user_id: string;
  video_url: string;
  title: string;
  description: string;
  summary: string;
  is_complete: boolean;
};

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: videos, error } = await supabaseClient.from("videos").select("*");

  if (error) {
    return json([], { headers });
  }

  return json(videos, { headers });
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const formData = await request.formData();

  console.log("video_url", formData.get("video_url"));

  const { data: { user } } = await supabaseClient.auth.getUser()

  const { error } = await supabaseClient.from("videos").insert({
    user_id: user?.id,
    video_url: formData.get("video_url") as string,
  });

  console.log("error", error);

  if (error) {
    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function Dashboard() {
  const actionResponse = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const videos: Video[] = useLoaderData();

  console.log("actionResponse", actionResponse);

  useEffect(() => {
    if (actionResponse?.success) {
      formRef.current?.reset();
    }
  }, [actionResponse]);

  return (
    <div className="py-8 md:py-16 mx-auto w-full max-w-screen-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
        <Form action="/sign-out" method="post">
          <button
            type="submit"
            className="mt-4 px-2.5 py-1 bg-gray-100 rounded-md text-sm"
          >
            Sign Out
          </button>
        </Form>
      </div>

      <div className="mt-8 mx-auto w-full max-w-sm">
        <Form ref={formRef} method="post" className="flex items-center space-x-2">
          <input
            name="video_url"
            type="video_url"
            placeholder="YouTube video URL"
            required
            className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
          >
            Summarize
          </button>
        </Form>

        <div className="mt-4 space-y-2">
          {videos.map((video) => {
            if (!video.is_complete) {
              return (
                <div
                  key={video.id}
                  className="px-3 py-1.5 flex items-center justify-between rounded-lg odd:bg-gray-100"
                >
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-slate-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 bg-slate-700 rounded"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                          <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={video.id}
                className="px-3 py-1.5 flex items-center justify-between rounded-lg odd:bg-gray-100"
              >
                <a href={`/videos/${video.id}`} className="text-sm">
                  {video.title}
                </a>
                <Form action="/delete-video" method="post">
                  <input type="hidden" name="video_id" value={video.id} />
                  <button type="submit" aria-label="Delete video">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Form>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
