import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    return null;
  }

  return redirect("/dashboard", {
    headers,
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const { supabaseClient, headers } = createSupabaseServerClient(request);

  const formData = await request.formData();

  console.log("email", formData.get("email"));

  const { error } = await supabaseClient.auth.signInWithOtp({
    email: formData.get("email") as string,
    options: {
      emailRedirectTo: `${process.env.BASE_URL}/auth/confirm`,
    },
  });

  console.log("error", error);

  // TODO: if there is no error, we show "Please check you email" message
  if (error) {
    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function SignIn() {
  const actionResponse = useActionData<typeof action>();

  console.log("actionResponse", actionResponse);

  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Sign In
      </h1>
      {!actionResponse?.success ? (
        <Form method="post">
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            required
            className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
          >
            Sign in
          </button>
        </Form>
      ) : (
        <h3>Please check your email.</h3>
      )}
    </div>
  );
}
