import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useOutletContext, useRevalidator } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoPlayer } from "~/components/video-player";

import { SupabaseOutletContext } from "~/root";
import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Coshmu" },
    { name: "description", content: "The YouTube summarizer you never knew you needed!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: videos } = await supabaseClient
    .from("videos")
    .select()
    .neq("current_state", "failed");

  return json({
    videos: videos || [],
    env: {
      MY_SUPABASE_URL: process.env.MY_SUPABASE_URL!,
    },
  }, {
    headers,
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const formData = await request.formData();

  const youtubeUrl = formData.get("youtube_url") as string;

  if (!youtubeUrl) {
    return json({ success: false }, { headers });
  }

  const { data: { user } } = await supabaseClient.auth.getUser()

  const { error } = await supabaseClient.from("videos").insert({
    user_id: user?.id,
    youtube_url: youtubeUrl,
  });

  if (error) {
    console.error(error);

    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function Dashboard() {
  const { supabase } = useOutletContext<SupabaseOutletContext>();
  const actionResponse = useActionData<typeof action>();
  const { videos, env } = useLoaderData<typeof loader>();
  const [playingVideoId, setPlayingVideoId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const revalidator = useRevalidator();

  useEffect(() => {
    if (actionResponse?.success) {
      formRef.current?.reset();
    }
  }, [actionResponse]);

  useEffect(() => {
    const subscription = supabase
      .channel("videos")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "videos",
      }, (payload) => {
        console.log("Change received!", payload);

        revalidator.revalidate();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    }
  }, [supabase]);

  const getReadableDuration = useCallback((duration: string) => {
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const minutes = matches?.[2] ? parseInt(matches[2]) : 0;
    const seconds = matches?.[3] ? parseInt(matches[3]) : 0;

    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return formattedDuration;
  }, []);

  const getReadablePublishedAt = useCallback((date: string) => {
    return new Date(date).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <div className="py-8 md:py-16 mx-auto w-full max-w-screen-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Videos
        </h1>
        <Form action="/sign-out" method="post">
          <button
            type="submit"
            className="mt-4 px-2.5 py-1 bg-gray-100 rounded-md text-xs"
          >
            Sign out
          </button>
        </Form>
      </div>

      <Form ref={formRef} method="post" className="mt-8 flex items-center space-x-2">
        <input
          name="youtube_url"
          type="youtube_url"
          placeholder="YouTube video URL"
          className="px-3 py-2 bg-white border shadow-sm border-gray-300 placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
        />
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Summarize
        </button>
      </Form>

      <div className="mt-4 space-y-4">
        {videos.length === 0 && (
          <div className="px-3 py-2 flex items-center bg-gray-50 rounded-md gap-x-1.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600">
              <path d="M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.75 13.75C9.75 13.75 10 15.25 12 15.25C14 15.25 14.25 13.75 14.25 13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.5 10C10.5 10.2761 10.2761 10.5 10 10.5C9.72386 10.5 9.5 10.2761 9.5 10C9.5 9.72386 9.72386 9.5 10 9.5C10.2761 9.5 10.5 9.72386 10.5 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14.5 10C14.5 10.2761 14.2761 10.5 14 10.5C13.7239 10.5 13.5 10.2761 13.5 10C13.5 9.72386 13.7239 9.5 14 9.5C14.2761 9.5 14.5 9.72386 14.5 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <p className="text-sm text-gray-700">You don't yet have any video summaries.</p>
          </div>
        )}

        {videos.map((video) => {
          if (video.current_state === "pending") {
            return (
              <div
                key={video.id}
                className="p-5 flex items-center justify-between rounded-lg border shadow-sm border-gray-200 bg-white"
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
              className="p-4 rounded-lg border shadow-sm border-gray-200 bg-white"
            >
              <Link
                to={`/videos/${video.id}`}
                className="text-sm font-semibold hover:underline"
                dangerouslySetInnerHTML={{ __html: video.title }}
              />

              <div className="mt-2 flex items-center justify-between">
                <div className="flex space-x-4">
                  <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.8475 19.25H17.1525C18.2944 19.25 19.174 18.2681 18.6408 17.2584C17.8563 15.7731 16.068 14 12 14C7.93201 14 6.14367 15.7731 5.35924 17.2584C4.82597 18.2681 5.70558 19.25 6.8475 19.25Z" />
                    </svg>
                    {video.channel}
                  </span>

                  <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                      <path stroke="currentColor" strokeWidth="1.5" d="M12 8V12L14 14" />
                    </svg>
                    {getReadableDuration(video.duration)}
                  </span>

                  <span className="text-gray-800 text-xs inline-flex items-center gap-x-1">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V8.75Z" />
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 4.75V8.25" />
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 4.75V8.25" />
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.75 10.75H16.25" />
                    </svg>
                    {getReadablePublishedAt(video.published_at)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  {video.transcribed_at && (
                    <VideoPlayer
                      url={env.MY_SUPABASE_URL}
                      videoId={video.id}
                      playingVideoId={playingVideoId}
                      setPlayingVideoId={setPlayingVideoId}
                    />
                  )}

                  <Form action="/delete-video" method="post">
                    <input type="hidden" name="video_id" value={video.id} />
                    <button
                      type="submit"
                      className="text-red-700 text-xs inline-flex items-center gap-x-1 hover:underline"
                    >
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 7.75L7.59115 17.4233C7.68102 18.4568 8.54622 19.25 9.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 7.5V6.75C9.75 5.64543 10.6454 4.75 11.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.5" />
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 7.75H19" />
                      </svg>
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
