import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Anthropic from "npm:@anthropic-ai/sdk"

import { fetchCaptions } from "../_lib/fetch-captions.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("MY_SUPABASE_URL") ?? "",
    Deno.env.get("MY_SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  )

  const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
  })

  const { video } = await req.json()

  console.log(`Capsumming video ${video.id}...`)

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

    const message = await anthropic.messages.create({
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `
          Write a short summary of the video captions below.

          Ignore any irrelevant intro/outro messaging, as well as ads/sponsorships and focus on the main content.

          Include a section for the summary, followed by a section for Key Points (highlighting the most
          important or interesting points from the video), Analysis (providing insights, opinions, or
          additional context related to the video content), and Keywords (key terms or phrases extracted
          from the video content to provide a quick reference or overview of the main themes discussed).

          Each keyword in the "Keywords" section should be followed by a colon and a sentence elaborating
          on its significance in the video. The keywords should be in the same order as they appear
          in the video, and the sentences should be concise. The keywords and colon should be bold, and
          the sentences should be in plain text. Keywords should ideally be one single word, followed by
          a sentence that explains its relevance to the video content.

          Return the summary in markdown format, headings should be H3 and content should be in bullet points.

          Headings should not have a colon or period at the end.

          Captions:

          ${videoData.content}
        `,
      }],
      model: 'claude-3-opus-20240229',
    })

    const subtitlesSummary = message.content[0].text

    if (!subtitlesSummary) {
      throw new Error("No summary generated")
    }

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
      .update({
        current_state: "failed",
        failed_reason: error.message,
      })
      .eq("id", video.id)

    return new Response(
      JSON.stringify({
        success: false,
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  }
})
