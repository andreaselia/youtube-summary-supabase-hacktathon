// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { video } = await req.json()

  console.log(`Transcribing video ${video.id}...`)

  const regexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
  const match = regexp.exec(video.video_url);
  const videoId = match[1]; // e.g. "dQw4w9WgXcQ"

  console.log(`Video ID: ${videoId}`);

  // TODO: fetch caption ids from /captions endpoint?
  // https://www.googleapis.com/youtube/v3/captions?videoId=VIDEO_ID&key=API_KEY

  // TODO: fetch captions from /captions/:id endpoint?

  // TODO: verify the endpoints above, can't remember what they are exactly at the moment

  return new Response(
    JSON.stringify({
      message: `Hello video ${video.id}!`,
    }),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/transcribe' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
