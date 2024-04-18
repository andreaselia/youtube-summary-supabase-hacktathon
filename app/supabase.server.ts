import { createServerClient, parse, serialize } from "@supabase/ssr";

const { MY_SUPABASE_URL, MY_SUPABASE_ANON_KEY } = process.env;

export const createSupabaseServerClient = (request: Request) => {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabaseClient = createServerClient(
    MY_SUPABASE_URL!,
    MY_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    },
  );

  return { supabaseClient, headers };
};
