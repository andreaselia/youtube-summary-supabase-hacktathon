import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { createSupabaseServerClient } from "~/supabase.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);

  const user = await supabaseClient.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return null;
};

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Dashboard
      </h1>
    </div>
  );
}
