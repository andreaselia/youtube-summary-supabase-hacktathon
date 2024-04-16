import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

import { fetchCaptions } from "../_lib/fetch-captions.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("MY_SUPABASE_URL") ?? "",
    Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY") ?? ""
    // { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  )

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")!,
  })

  const { video } = await req.json()

  console.log(`Transcribing video ${video.id}...`)

  // eslint-disable-next-line no-useless-escape
  const regexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
  const match = regexp.exec(video.video_url)
  const videoId = match ? match[1] : "dQw4w9WgXcQ"

  console.log("Fetching captions for video:", videoId)

  const captions = await fetchCaptions(videoId)

  // Provide a summary of the video content structured with headings,
  // key insights, highlighted points, and keywords with corresponding
  // descriptive sentences. Each keyword should be followed by a colon
  // and a sentence elaborating on its significance in the video.
  const chatCompletion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: `
        Write a short summary of the video captions below.
        Include a section for the summary, key takeaways, highlights and keywords.
        Each keyword should be followed by a colon and a sentence elaborating on its significance in the video.
        Ignore any intro and outro in the video that may not be relevant.
        Return the summary in markdown format, headings should be H3 and content should be in bullet points.
        Headings should not have a colon or period at the end.
        Captions: ${captions.subtitles}`,
    }],
    model: "gpt-3.5-turbo",
    stream: false,
  })

  const subtitlesSummary = chatCompletion.choices[0].message.content

  console.log("Captions found")

  const { error } = await supabaseClient
    .from("videos")
    .update({
      title: captions.title,
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
