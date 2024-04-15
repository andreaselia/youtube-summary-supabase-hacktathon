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
    return { error: `Could not find captions for video ${videoId}` };
  }

  const titleMatch = videoData.match(/<meta name="title" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);
  const descriptionMatch = videoData.match(/<meta name="description" content="([^"]*|[^"]*[^&]quot;[^"]*)">/);

  const title = titleMatch ? titleMatch[1] : "No title found";
  const description = descriptionMatch ? descriptionMatch[1] : "No description found";

  const regex = /"captionTracks":(\[.*?\])/;
  const regexResult = regex.exec(videoData);

  if (!regexResult) {
    return { error: `Could not extract captionTracks for video ${videoId}` };
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
    return { error: `Could not find en lang for video ${videoId}` };
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
    description,
    subtitles: joinedLines,
  };
};
