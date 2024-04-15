// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

import { fetchCaptions } from "../_lib/fetch-captions.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('MY_SUPABASE_URL') ?? '',
    Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
    // { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')!,
  })

  const { video } = await req.json()

  console.log(`Transcribing video ${video.id}...`)

  // eslint-disable-next-line no-useless-escape
  const regexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
  const match = regexp.exec(video.video_url)
  const videoId = match[1] // e.g. "dQw4w9WgXcQ"

  console.log("Fetching captions for video:", videoId)

  const captions = await fetchCaptions(videoId)

  const chatCompletion = await openai.chat.completions.create({
    messages: [{
      role: 'user',
      content: `
        Write a short summary of the video captions below.
        Include a section for the summary, key takeaways, highlights and keywords.
        Ignore any intro and outro in the video that may not be relevant.
        Return the summary in markdown format.
        Use H3 for the key takeaways, highlights and keywords.
        Captions: ${captions.subtitles}`,
    }],
    model: 'gpt-3.5-turbo',
    stream: false,
  })

  const subtitlesSummary = chatCompletion.choices[0].message.content

  console.log("Captions found")

  const { error } = await supabaseClient
    .from("videos")
    .update({
      title: captions.title,
      description: captions.description,
      summary: subtitlesSummary,
      is_complete: true,
    })
    .eq("id", video.id)

  if (error) {
    console.error("Failed to update video:", error)

    console.log(error.message)
  }

  return new Response(
    JSON.stringify({
      success: true,
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
