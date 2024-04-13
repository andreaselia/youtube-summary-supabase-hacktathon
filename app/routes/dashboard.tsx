import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
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
