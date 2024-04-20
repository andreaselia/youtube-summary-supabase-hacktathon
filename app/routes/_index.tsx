import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Coshmu" },
    { name: "description", content: "The YouTube summarizer you never knew you needed!" },
  ];
};

export default function Index() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">
        Coshmu
      </h1>

      <div className="flex items-center gap-x-2">
        <Link to="/sign-in" className="mt-4 px-2.5 py-1 bg-gray-100 rounded-md text-sm">
          Sign in
        </Link>

        <Link to="/sign-up" className="mt-4 px-2.5 py-1 bg-gray-100 rounded-md text-sm">
          Sign up
        </Link>
      </div>
    </div>
  );
}
