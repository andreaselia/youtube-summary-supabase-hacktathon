import he from "npm:he";
import striptags from "npm:striptags";

type Subtitle = {
  text: string;
};

type CaptionTrack = {
  baseUrl: string;
  vssId: string;
};

export const fetchCaptions = async (videoId: string) => {
  const videoResponse = await fetch(`https://youtube.com/watch?v=${videoId}`);
  const videoData = await videoResponse.text();

  if (!videoData.includes("captionTracks")) {
    throw new Error(`Could not find captions for video ${videoId}`);
  }


  const titleMatch = videoData.match(/<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);
  const durationMatch = videoData.match(/<meta itemprop="duration" content="([^"]+)"\s*>/);
  const datePublishedMatch = videoData.match(/<meta itemprop="datePublished" content="([^"]+)"\s*>/);

  console.log("titleMatch", titleMatch);
  console.log("durationMatch", durationMatch);
  console.log("datePublishedMatch", datePublishedMatch);

  const title = titleMatch ? titleMatch[1] : "No title found";
  const duration = durationMatch ? durationMatch[1] : null;
  const datePublished = datePublishedMatch ? datePublishedMatch[1] : null;

  const captionTracksRegex = /"captionTracks":(\[.*?\])/;
  const captionTracksRegexResult = captionTracksRegex.exec(videoData);

  if (!captionTracksRegexResult) {
    throw new Error(`Could not extract captions for video ${videoId}`);
  }

  const authorRegex = /"ownerChannelName":"([^"]+)"/;
  const authorRegexResult = authorRegex.exec(videoData);
  const videoOwner = authorRegexResult ? authorRegexResult[1] : null;

  const captionTracks = JSON.parse(captionTracksRegexResult[1]);

  const subtitle = captionTracks.find((track: CaptionTrack) =>
    track.vssId === ".en" || track.vssId === "a.en" ||
      (track.vssId && track.vssId.match(".en"))
  );

  if (!subtitle?.baseUrl) {
    throw new Error(`Could not find en lang for video ${videoId}`);
  }

  const subtitlesResponse = await fetch(subtitle.baseUrl);
  const transcriptData = await subtitlesResponse.text();

  const lines = transcriptData
    .replace("<?xml version=\"1.0\" encoding=\"utf-8\" ?><transcript>", "")
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

  return {
    title,
    content: joinedLines,
    duration,
    channel: videoOwner,
    published_at: datePublished,
  };
};
