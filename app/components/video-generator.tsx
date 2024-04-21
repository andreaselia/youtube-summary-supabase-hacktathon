import { Form } from "@remix-run/react";

export default function VideoGenerator({
  videoId,
  videoState,
}: {
  videoId: string;
  videoState: string;
}) {
  if (videoState === "synthesizing") {
    return (
      <button
        type="button"
        className="text-xs inline-flex items-center gap-x-1.5 text-gray-700"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin">
          <path d="M11.25 14.75L8.75 17M8.75 17L11.25 19.25M8.75 17H13.25C16.5637 17 19.25 14.3137 19.25 11V10.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.25 7H10.75C7.43629 7 4.75 9.68629 4.75 13V13.25M15.25 7L12.75 9.25M15.25 7L12.75 4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Synthesizing...
      </button>
    );
  }

  return (
    <Form action="/synthesize" method="post" className="inline-flex">
      <input type="hidden" name="video_id" value={videoId} />
      <button
        type="submit"
        className="text-xs inline-flex items-center gap-x-1 hover:underline"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
          <path d="M11.25 14.75L8.75 17M8.75 17L11.25 19.25M8.75 17H13.25C16.5637 17 19.25 14.3137 19.25 11V10.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.25 7H10.75C7.43629 7 4.75 9.68629 4.75 13V13.25M15.25 7L12.75 9.25M15.25 7L12.75 4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Generate Audio
      </button>
    </Form>
  );
}
