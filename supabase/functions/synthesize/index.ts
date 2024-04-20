import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

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

  console.log(`Synthesizing video ${video.id}...`)

  try {
    const tts = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: video.content,
    })

    const arrayBuffer = await tts.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    await supabaseClient.storage
      .from("tts")
      .upload(`${video.id}.mp3`, uint8Array)

    await supabaseClient
      .from("videos")
      .update({
        current_state: "active",
        synthesized_at: new Date().toISOString(),
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
