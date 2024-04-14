import he from "he";
import striptags from "striptags";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createSupabaseServerClient } from "~/supabase.server";

type Subtitle = {
  text: string;
};

type CaptionTrack = {
  baseUrl: string;
  vssId: string;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const videoId = "qA65QjWCl60";

  const videoResponse = await fetch(`https://youtube.com/watch?v=${videoId}`);
  const videoData = await videoResponse.text();

  if (!videoData.includes("captionTracks")) {
    return json(`Could not find captions for video ${videoId}`, {
      headers,
    });
  }

  const titleMatch = videoData.match(/<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);
  const descriptionMatch = videoData.match(/<meta name="description" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);

  const title = titleMatch ? titleMatch[1] : "No title found";
  const description = descriptionMatch ? descriptionMatch[1] : "No description found";

  const regex = /"captionTracks":(\[.*?\])/;
  const regexResult = regex.exec(videoData);

  if (!regexResult) {
    return json(`Could not extract captionTracks for video ${videoId}`, {
      headers,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, captionTracksJson] = regexResult;
  const captionTracks = JSON.parse(captionTracksJson);

  const lang = "en";

  const subtitle =
    captionTracks.find((track: CaptionTrack) => track.vssId === `.${lang}`) ||
    captionTracks.find((track: CaptionTrack) => track.vssId === `a.${lang}`) ||
    captionTracks.find((track: CaptionTrack) => track.vssId && track.vssId.match(`.${lang}`));

  if (!subtitle?.baseUrl) {
    return json(`Could not find en lang for video ${videoId}`, {
      headers,
    });
  }

  const subtitlesResponse = await fetch(subtitle.baseUrl);
  const transcriptData = await subtitlesResponse.text();

  const lines = transcriptData
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
    .replace("</transcript>", "")
    .split("</text>")
    .filter((line: string) => line && line.trim())
    .reduce((acc: Subtitle[], line: string) => {

      const htmlText = line
        .replace(/<text.+>/, "")
        .replace(/&amp;/gi, "&")
        .replace(/<\/?[^>]+(>|$)/g, "");
      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);

      acc.push({
        text,
      });

      return acc;
    }, []);

  const joinedLines = lines.map((line: Subtitle) => line.text).join(" ");

  return json({
    title,
    description,
    subtitles: joinedLines,
  }, {
    headers,
  });
};

export default function Captions() {
  const actionResponse = useActionData<typeof action>();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Captions
      </h1>
      <Form method="post">
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Get Captions
        </button>
      </Form>
      <div>
        {JSON.stringify(actionResponse, null, 2)}
      </div>
    </div>
  );
}
