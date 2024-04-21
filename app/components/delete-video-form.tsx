import { Form } from "@remix-run/react";

export default function DeleteVideoForm({ videoId }: { videoId: string }) {
  return (
    <Form action="/delete-video" method="post" className="inline-flex">
      <input type="hidden" name="video_id" value={videoId} />
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
  );
}
