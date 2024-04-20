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

  const titleMatch = videoData.match(/<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/)
  const durationMatch = videoData.match(/<meta itemprop="duration" content="([^"]+)"\s*>/);
  const datePublishedMatch = videoData.match(/<meta itemprop="datePublished" content="([^"]+)"\s*>/);

  const authorSpanMatch = videoData.match(/<span itemprop="author".*?>[\s\S]*?<\/span>/gm)?.[0];

  const channelUrlMatch = authorSpanMatch?.match(/<link itemprop="url" href="([^"]+)">/);
  const channelNameMatch = authorSpanMatch?.match(/<link itemprop="name" content="([^"]+)">/);

  const title = titleMatch ? titleMatch[1] : "No title found";
  const channelUrl = channelUrlMatch ? channelUrlMatch[1] : null;
  const channelName = channelNameMatch ? channelNameMatch[1] : null;
  const duration = durationMatch ? durationMatch[1] : null;
  const datePublished = datePublishedMatch ? datePublishedMatch[1] : null;

  const captionTracksRegex = /"captionTracks":(\[.*?\])/;
  const captionTracksRegexResult = captionTracksRegex.exec(videoData);

  if (!captionTracksRegexResult) {
    throw new Error(`Could not extract captions for video ${videoId}`);
  }

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
    channel_url: channelUrl,
    content: joinedLines,
    duration,
    channel: channelName,
    published_at: datePublished,
  };
};
