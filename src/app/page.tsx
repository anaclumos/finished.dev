import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Clerk Auth MVP</h1>
      <p className="mt-2">Choose a route to verify authentication.</p>
      <div className="mt-4 flex gap-4">
        <Link className="underline" href="/sign-in">
          Sign in
        </Link>
        <Link className="underline" href="/sign-up">
          Sign up
        </Link>
        <Link className="underline" href="/dashboard">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
