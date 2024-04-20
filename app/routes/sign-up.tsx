import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Coshmu" },
    { name: "description", content: "The YouTube summarizer you never knew you needed!" },
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

  const { error } = await supabaseClient.auth.signInWithOtp({
    email: formData.get("email") as string,
    options: {
      emailRedirectTo: `${process.env.BASE_URL}/auth/confirm`,
    },
  });

  if (error) {
    console.error(error);

    return json({ success: false }, { headers });
  }

  return json({ success: true }, { headers });
}

export default function SignUp() {
  const actionResponse = useActionData<typeof action>();
  const { state } = useNavigation();
  const busy = state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionResponse?.success) {
      formRef.current?.reset();
    }
  }, [actionResponse]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-xs">
        <h1 className="text-3xl font-bold">
          Sign Up
        </h1>

        <div className="mt-4 space-y-4">
          {actionResponse?.success && (
            <div className="px-3 py-2 flex items-center bg-green-50 rounded-md gap-x-1.5">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="w-5 h-5 text-green-600">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 12C4.75 7.99594 7.99594 4.75 12 4.75V4.75C16.0041 4.75 19.25 7.99594 19.25 12V12C19.25 16.0041 16.0041 19.25 12 19.25V19.25C7.99594 19.25 4.75 16.0041 4.75 12V12Z" />
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 12.75L10.1837 13.6744C10.5275 14.407 11.5536 14.4492 11.9564 13.7473L14.25 9.75" />
              </svg>
              <p className="text-sm text-green-700">We've emailed you a link to sign up.</p>
            </div>
          )}

          <Form ref={formRef} method="post">
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              required
              className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
            />
            <button
              type="submit"
              className="mt-2 w-full bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:bg-slate-200 disabled:hover:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled={busy}
            >
              Sign up
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
