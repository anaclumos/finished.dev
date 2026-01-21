import { Button } from "@base-ui/react/button";
import { auth } from "@clerk/nextjs/server";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PushSubscriptionClient from "./PushSubscriptionClient";

export default function DashboardPage() {
  const { userId } = auth();

  return (
    <main className="space-y-8 p-6">
      <header>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-2">Signed in user: {userId}</p>
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Agent Hooks</h2>
            <p className="text-sm text-slate-600">Manage agent webhook targets.</p>
          </div>
          <Button className="inline-flex items-center gap-2 text-sm underline">
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={1.8} />
            Add hook
          </Button>
        </div>
        <ul className="text-sm text-slate-600">
          <li>No hooks configured yet.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Webhook Format</h2>
        <p className="text-sm text-slate-600">
          POST requests to <code className="font-mono">/api/webhooks/{`{agentId}`}</code>.
        </p>
        <p className="text-sm text-slate-600">
          Send <code className="font-mono">x-agent-secret</code> with your shared secret.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Events</h2>
        <ul className="text-sm text-slate-600">
          <li>No events yet.</li>
        </ul>
      </section>

      <PushSubscriptionClient />
    </main>
  );
}
