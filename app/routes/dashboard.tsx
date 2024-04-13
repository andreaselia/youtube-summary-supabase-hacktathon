import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    return redirect("/sign-in", {
      headers,
    });
  }

  return null;
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const formData = await request.formData();

  console.log("video_url", formData.get("video_url"));

  const { error } = await supabaseClient.from("videos").insert({
    video_url: formData.get("video_url") as string,
  });

  console.log("error", error);

  if (error) {
    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function Dashboard() {
  const actionResponse = useActionData<typeof action>();

  console.log("actionResponse", actionResponse);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Dashboard
      </h1>
      <Form action="/sign-out" method="post">
        <button type="submit">Sign Out</button>
      </Form>
      {!actionResponse?.success ? (
        <Form method="post">
          <input
            name="video_url"
            type="video_url"
            placeholder="YouTube video URL"
            required
            className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
          >
            Summarize
          </button>
        </Form>
      ) : (
        <h3>We are summarizing the video. Please wait...</h3>
      )}
    </div>
  );
}
