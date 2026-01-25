import { createFileRoute, Link } from '@tanstack/react-router'
import {
  SignedIn,
  SignedOut,
  ClerkLoading,
  ClerkLoaded,
} from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { CodeBlock, InlineCode } from '@/components/code-block'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Notification01Icon,
  CommandIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  LaptopIcon,
  CloudIcon,
  FlashIcon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/')({ component: LandingPage })

const features = [
  {
    icon: CommandIcon,
    title: 'Simple CLI',
    description:
      'Install the CLI, run "finished ping" when your task completes. That\'s it.',
  },
  {
    icon: Notification01Icon,
    title: 'Instant Push Notifications',
    description:
      'Get browser notifications the moment your agents finish their work.',
  },
  {
    icon: Clock01Icon,
    title: 'Task History',
    description:
      'Track all completed tasks with timestamps, durations, and source info.',
  },
]

const useCases = [
  {
    icon: LaptopIcon,
    title: 'Long-running AI Tasks',
    description:
      'Know when Claude, GPT, or your local LLM finishes a complex task.',
  },
  {
    icon: CloudIcon,
    title: 'Background Builds',
    description:
      'Get notified when your builds, tests, or deployments complete.',
  },
  {
    icon: FlashIcon,
    title: 'Agent Workflows',
    description:
      'Monitor multi-step Agent workflows across multiple machines.',
  },
]

const cliExample = `# Install the CLI
bun install -g @finished/cli

# Configure your API key
finished init

# Send notifications when tasks complete
finished ping "Code review done"
finished ping "Tests passed" --status success
finished ping "Build failed" --status failure`

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="finished.dev logo" className="h-8 w-8" />
            <span className="font-semibold text-zinc-900">finished.dev</span>
          </div>

          <div className="flex items-center gap-4">
            <ClerkLoading>
              <Link
                to="/sign-in"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Sign In
              </Link>
              <Link to="/waitlist">
                <Button size="sm">Waitlist</Button>
              </Link>
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Sign In
                </Link>
                <Link to="/waitlist">
                  <Button size="sm">Waitlist</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-600">
              <HugeiconsIcon
                icon={FlashIcon}
                size={14}
                className="text-amber-500"
              />
              Agent Fleet Management
            </div>

            <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl">
              Know When Your
              <br />
              <span className="text-amber-500">Agents Finish</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-zinc-600">
              Stop checking terminals. Get instant push notifications when your
              agents, builds, or background tasks complete. One CLI command,
              zero friction.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <ClerkLoading>
                <Link to="/waitlist">
                  <Button size="lg">Waitlist</Button>
                </Link>
              </ClerkLoading>
              <ClerkLoaded>
                <SignedOut>
                  <Link to="/waitlist">
                    <Button size="lg">Waitlist</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                </SignedIn>
              </ClerkLoaded>
            </div>

            {/* CLI Preview */}
            <div className="mt-12">
              <CodeBlock code={cliExample} />
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2">
          <div className="mx-auto h-[400px] w-[800px] rounded-full bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 blur-3xl" />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              How It Works
            </h2>
            <p className="mt-4 text-zinc-600">
              Three steps to never miss a finished task again.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Install the CLI
              </h3>
              <p className="mt-2 text-zinc-600">
                One command to install. Works with Bun, npm, or run directly.
              </p>
              <InlineCode>bun install -g @finished/cli</InlineCode>
            </div>

            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Configure Once
              </h3>
              <p className="mt-2 text-zinc-600">
                Run init to set your API key. Takes 10 seconds.
              </p>
              <InlineCode>finished init</InlineCode>
            </div>

            <div className="relative rounded-2xl border border-zinc-200 bg-white p-8">
              <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                Ping When Done
              </h3>
              <p className="mt-2 text-zinc-600">
                Add to any script or run manually. Get notified instantly.
              </p>
              <InlineCode>finished ping "Task done!"</InlineCode>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Simple, Powerful, Reliable
            </h2>
            <p className="mt-4 text-zinc-600">
              Everything you need to stay on top of your async work.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <HugeiconsIcon icon={feature.icon} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-zinc-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                Perfect For
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                Anyone who runs async tasks and wants to know when they&apos;re
                done.
              </p>

              <div className="mt-8 space-y-6">
                {useCases.map((useCase) => (
                  <div key={useCase.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
                      <HugeiconsIcon icon={useCase.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900">
                        {useCase.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <ClerkLoading>
                  <Link to="/waitlist">
                    <Button>Waitlist</Button>
                  </Link>
                </ClerkLoading>
                <ClerkLoaded>
                  <SignedOut>
                    <Link to="/waitlist">
                      <Button>Waitlist</Button>
                    </Link>
                  </SignedOut>
                </ClerkLoaded>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                  </span>
                  Live Notifications
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={16}
                      className="text-zinc-400"
                    />
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      claude
                    </span>
                    <span>Refactored auth module</span>
                    <span className="ml-auto text-xs text-zinc-400">now</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={16}
                      className="text-zinc-400"
                    />
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      cursor
                    </span>
                    <span>Fixed 12 TypeScript errors</span>
                    <span className="ml-auto text-xs text-zinc-400">2m</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={16}
                      className="text-zinc-400"
                    />
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      opencode
                    </span>
                    <span>PR #847 merged to main</span>
                    <span className="ml-auto text-xs text-zinc-400">5m</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={16}
                      className="text-zinc-400"
                    />
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      cli
                    </span>
                    <span>Deploy to production complete</span>
                    <span className="ml-auto text-xs text-zinc-400">8m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 bg-zinc-900 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Stop Watching Terminals
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Let your agents notify you. to start, no credit card
            required.
          </p>
          <div className="mt-10">
            <ClerkLoading>
              <Link to="/waitlist">
                <Button
                  size="lg"
                  className="bg-white text-zinc-900 hover:bg-zinc-100"
                >
                  Waitlist
                </Button>
              </Link>
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <Link to="/waitlist">
                  <Button
                    size="lg"
                    className="bg-white text-zinc-900 hover:bg-zinc-100"
                  >
                    Waitlist
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-white text-zinc-900 hover:bg-zinc-100"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </ClerkLoaded>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="finished.dev logo" className="h-8 w-8" />
              <span className="font-semibold text-white">finished.dev</span>
            </div>
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} finished.dev. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
