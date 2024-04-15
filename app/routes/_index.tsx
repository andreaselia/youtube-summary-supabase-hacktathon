import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Link to="/dashboard" className="mt-4 px-2 py-1 bg-gray-100 rounded-md text-sm font-semibold">Go to dashboard</Link>
    </div>
  );
}
