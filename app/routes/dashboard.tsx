import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createSupabaseServerClient } from "~/supabase.server";

type Video = {
  id: string;
  user_id: string;
  youtube_url: string;
  title: string;
  content: string;
  duration: string;
  channel: string;
  published_at: string;
  current_state: 'pending' | 'active' | 'failed';
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

  const { data: videos, error } = await supabaseClient
    .from("videos")
    .select("*")
    .neq("current_state", "failed");

  if (error) {
    return json([], { headers });
  }

  return json(videos, { headers });
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const formData = await request.formData();

  const { data: { user } } = await supabaseClient.auth.getUser()

  const { error } = await supabaseClient.from("videos").insert({
    user_id: user?.id,
    youtube_url: formData.get("youtube_url") as string,
  });

  if (error) {
    console.error(error);

    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function Dashboard() {
  const actionResponse = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const videos: Video[] = useLoaderData();

  useEffect(() => {
    if (actionResponse?.success) {
      formRef.current?.reset();
    }
  }, [actionResponse]);

  return (
    <div className="py-8 md:py-16 mx-auto w-full max-w-screen-md">
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

      <div className="mt-8 mx-auto w-full max-w-screen-sm">
        <Form ref={formRef} method="post" className="flex items-center space-x-2">
          <input
            name="youtube_url"
            type="youtube_url"
            placeholder="YouTube video URL"
            required
            className="px-3 py-2 bg-white border shadow-sm border-gray-300 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
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
            if (video.current_state === "pending") {
              return (
                <div
                  key={video.id}
                  className="p-5 flex items-center justify-between rounded-xl border shadow-sm border-gray-300 bg-white"
                >
                  <div className="w-full animate-pulse">
                    <div className="w-full h-5 bg-gray-500 rounded"></div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={video.id}
                className="p-4 flex items-center justify-between rounded-lg border shadow-sm border-gray-300 bg-white"
              >
                <div className="flex flex-col">
                  <h3
                    className="text-sm font-semibold"
                    dangerouslySetInnerHTML={{ __html: video.title }}
                  />

                  <div className="mt-2 flex space-x-4">
                    <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                        <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.8475 19.25H17.1525C18.2944 19.25 19.174 18.2681 18.6408 17.2584C17.8563 15.7731 16.068 14 12 14C7.93201 14 6.14367 15.7731 5.35924 17.2584C4.82597 18.2681 5.70558 19.25 6.8475 19.25Z" />
                      </svg>
                      {video.author}
                    </span>

                    <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V8.75Z" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4.75V8.25" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 4.75V8.25" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.75 10.75H16.25" />
                      </svg>
                      <span>November 16, 2022</span>
                      {/* {loaderResponse.creation_date} */}
                    </span>

                    <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                        <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                        <path stroke="currentColor" strokeWidth="1.5" d="M12 8V12L14 14" />
                      </svg>
                      <span>6:49</span>
                      {/* {loaderResponse.duration} */}
                    </span>
                  </div>
                </div>
                <div className="flex gap-x-1">
                  <Form action="/delete-video" method="post">
                    <input type="hidden" name="video_id" value={video.id} />
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 text-red-600 text-center"
                    >
                      Delete
                    </button>
                  </Form>

                  <Link
                    to={`/videos/${video.id}`}
                    className="bg-gray-100 text-xs px-3 py-1.5 rounded-md text-gray-800 font-semibold text-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
