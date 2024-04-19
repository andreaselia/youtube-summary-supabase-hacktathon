import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";

export type Video = {
  id: string;
  user_id: string;
  youtube_url: string;
  title: string;
  content: string;
  duration: string;
  channel: string;
  published_at: string;
  current_state: "pending" | "active" | "failed";
};

export function VideoPlayer({ url, videoId, disableAudio, onPlay }: { url: string; videoId: string; disableAudio: boolean; onPlay: (videoId: string) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (disableAudio) {
      setIsPlaying(false);

      if (typeof document !== "undefined") {
        return;
      }

      pauseAudio();
    }
  }, [disableAudio]);

  const playAudio = () => {
    const audioPlayer = document.getElementById(`audio-${videoId}`) as HTMLAudioElement;

    audioPlayer.play();

    setIsPlaying(true);

    onPlay(videoId);
  };

  const pauseAudio = () => {
    const audioPlayer = document.getElementById(`audio-${videoId}`) as HTMLAudioElement;

    audioPlayer.pause();

    setIsPlaying(false);
  };

  return (
    <ClientOnly
      fallback={
        <button
          type="button"
          className="text-xs inline-flex items-center gap-x-1 hover:underline disabled:opacity-50"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.25 12L5.75 5.75V18.25L18.25 12Z" />
          </svg>
          Play Audio
        </button>
      }
    >
      {() => (
        <>
          <audio
            id={`audio-${videoId}`}
            src={`${url}/storage/v1/object/public/tts/${videoId}.mp3`}
          />
          {isPlaying ? (
            <button
              type="button"
              className="text-xs inline-flex items-center gap-x-1 hover:underline"
              onClick={() => pauseAudio()}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.25 6.75V17.25"></path>
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.75 6.75V17.25"></path>
              </svg>
              Pause Audio
            </button>
          ) : (
            <button
              type="button"
              className="text-xs inline-flex items-center gap-x-1 hover:underline"
              onClick={() => playAudio()}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-4 h-4">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.25 12L5.75 5.75V18.25L18.25 12Z" />
              </svg>
              Play Audio
            </button>
          )}
        </>
      )}
    </ClientOnly>
  );
}
