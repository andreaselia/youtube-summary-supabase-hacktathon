import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createSupabaseServerClient } from "~/supabase.server";

interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

interface CaptionTrack {
  baseUrl: string;
  vssId: string;
}

interface Options {
  videoID: string;
  lang?: string;
}

interface VideoDetails {
  title: string;
  description: string;
  subtitles: Subtitle[];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const videoId = "qA65QjWCl60";

  const response = await fetch(`https://youtube.com/watch?v=${videoId}`);
  const data = await response.text();

  if (!data.includes("captionTracks")) {
    return json(`Could not find captions for video ${videoId}`, {
      headers,
    });
  }

  const titleMatch = data.match(/<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);
  const descriptionMatch = data.match(/<meta name="description" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);

  const title = titleMatch ? titleMatch[1] : "No title found";
  const description = descriptionMatch ? descriptionMatch[1] : "No description found";

  const regex = /"captionTracks":(\[.*?\])/;
  const regexResult = regex.exec(data);

  if (!regexResult) {
    return json(`Could not extract captionTracks for video ${videoId}`, {
      headers,
    });
  }

  const [_, captionTracksJson] = regexResult;
  const captionTracks = JSON.parse(captionTracksJson);

  const subtitle =
    captionTracks.find((track: CaptionTrack) => track.vssId === `.${lang}`) ||
    captionTracks.find((track: CaptionTrack) => track.vssId === `a.${lang}`) ||
    captionTracks.find(
      (track: CaptionTrack) => track.vssId && track.vssId.match(`.${lang}`)
    );

      // console.log("result", regexMatch);
  // const captions = "test";

  // const data = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=9bZkp7q19f0&key=${GOOGLE_API_KEY}`)
  // const data = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=9bZkp7q19f0&id=AUieDaaWOv5QldE1qYQ0Oop_vAq4COlampNKYULwQfX4oV_VU3k&key=${GOOGLE_API_KEY}`)
  // const data = await fetch(`https://www.googleapis.com/youtube/v3/captions/id?id=AUieDaaWOv5QldE1qYQ0Oop_vAq4COlampNKYULwQfX4oV_VU3k`, {
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // })
  //   .then(response => response.json());

  // console.log("data", data);
  // console.log("data", data.items[0].snippet);

  return json(captionTracks, {
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
