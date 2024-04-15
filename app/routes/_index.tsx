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
    <div>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Link to="/dashboard">Go to dashboard</Link>
    </div>
  );
}
