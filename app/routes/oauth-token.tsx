import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
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

  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ],
    include_granted_scopes: true,
  });

  return json(authUrl, {
    headers,
  });
};

export default function OauthToken() {
  const actionResponse = useActionData<typeof action>();

  console.log("actionResponse", actionResponse);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        OAuth Token
      </h1>
      <Form method="post">
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Generate OAuth URL
        </button>
      </Form>
      <div>
        {actionResponse}
      </div>
    </div>
  );
}
