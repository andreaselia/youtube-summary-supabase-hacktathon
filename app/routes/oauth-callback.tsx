import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { OAuth2Client } from "google-auth-library";

import { createSupabaseServerClient } from "~/supabase.server";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const client = new OAuth2Client({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
  });

  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const scope = url.searchParams.get("scope");

  console.log("code 3", code);
  console.log("scope 3", scope);

  if (!code) {
    console.log('no code');

    return json({ error: "No code provided" }, {
      status: 400,
      headers,
    });
  }

  const token = await client.getToken(code);

  const accessToken = token.tokens.access_token;

  return json(accessToken, {
    headers,
  });
};

export default function OauthCallback() {
  const actionResponse = useActionData<typeof action>();

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        OAuth Callback
      </h1>
      <Form method="post">
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Get OAuth Token
        </button>
      </Form>
      <div>
        {JSON.stringify(actionResponse, null, 2)}
      </div>
    </div>
  );
}
