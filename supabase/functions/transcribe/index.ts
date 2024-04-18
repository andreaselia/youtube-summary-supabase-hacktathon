import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

import { fetchCaptions } from "../_lib/fetch-captions.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("MY_SUPABASE_URL") ?? "",
    Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  )

  const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")!,
  })

  const { video } = await req.json()

  console.log(`Transcribing video ${video.id}...`)

  try {
    // eslint-disable-next-line no-useless-escape
    const regexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi
    const match = regexp.exec(video.youtube_url)
    const videoId = match ? match[1] : null

    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    console.log("Fetching captions for video:", videoId)

    const videoData = await fetchCaptions(videoId)

    const chatCompletion = await openai.chat.completions.create({
      messages: [{
        role: "user",
        content: `
          Write a short summary of the video captions below.
          Ignore any intro and outro in the video that may not be relevant.
          Include a section for the summary of Main Insights, Essential Points, and Keywords.
          Each keyword in the "Keywords" section should be followed by a colon and a sentence elaborating on its significance in the video.
          The keywords should be in the same order as they appear in the video, and the sentences should be concise.
          The keywords and colon should be bold, and the sentences should be in plain text.
          Return the summary in markdown format, headings should be H3 and content should be in bullet points.
          Headings should not have a colon or period at the end.
          Captions: ${videoData.content}`,
      }],
      model: "gpt-3.5-turbo",
      stream: false,
    })

    const subtitlesSummary = chatCompletion.choices[0].message.content

    console.log("Captions found")

    await supabaseClient
      .from("videos")
      .update({
        ...videoData,
        content: subtitlesSummary,
        current_state: "active",
      })
      .eq("id", video.id)
      .throwOnError()

    return new Response(
      JSON.stringify({
        success: true,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error(error)

    await supabaseClient
      .from("videos")
      .update({ current_state: "failed" })
      .eq("id", video.id)
      .throwOnError()

    return new Response(
      JSON.stringify({
        success: false,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  }
})
