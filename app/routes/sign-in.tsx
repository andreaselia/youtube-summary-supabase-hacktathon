import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: { request: Request }) {
  let formData = await request.formData();

  console.log('login action', formData);

  return new Response('ok');
}

function LoginForm() {
  return (
    <Form method="post">
      <input name="email" type="email" className="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none" />
      <button type="submit" name="_action" value="login" className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white">Sign in</button>
    </Form>
  );
}

export default function SignIn() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">
        Sign In
      </h1>
      <LoginForm />
    </div>
  );
}
