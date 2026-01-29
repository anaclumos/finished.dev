# finished.dev

Agent Fleet Management - Phone Push Notifications When Agents Finish.

## What is this?

Get Phone Push Notifications the Moment Your Agents, Builds, or Background Tasks Complete.

```bash
# Install the CLI
bun install -g @finished/cli

# Configure your API key
finished init

# Send notifications when tasks complete
finished ping "Code review done"
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React 19) |
| **Database** | [Convex](https://convex.dev) (real-time backend) |
| **Auth** | [Clerk](https://clerk.com) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) + [Base UI](https://base-ui.com) |
| **Icons** | [Hugeicons](https://hugeicons.com) |
| **Package Manager** | [Bun](https://bun.sh) |
| **Monorepo** | [Turborepo](https://turbo.build) |

## Features

### CLI (`@finished/cli`)
- **`finished init`** - Configure your API key
- **`finished ping "message"`** - Send task completion notification
- **`finished test`** - Test the connection
- **`finished status`** - Show current configuration

### Web Dashboard
- Real-time task completion feed
- Task history with timestamps, durations, and sources
- API key management
- Push notification settings

### Push Notifications
- Browser push notifications via Web Push API
- Works even when browser tab is closed
- Customizable notification sounds

## Project Structure

```
finished.dev/
├── apps/
│   └── web/                    # Web application
│       ├── convex/             # Convex backend
│       │   ├── schema.ts       # Database schema
│       │   ├── apiKeys.ts      # API key management
│       │   ├── agentTasks.ts   # Task recording
│       │   ├── agentHooks.ts   # Push notification sender
│       │   ├── http.ts         # Webhook endpoint
│       │   └── ...
│       ├── public/
│       │   └── sw.js           # Service worker for push
│       └── src/
│           ├── routes/
│           │   ├── index.tsx           # Landing page
│           │   ├── _auth/              # Auth pages
│           │   └── _dashboard/         # Dashboard pages
│           ├── lib/
│           │   └── push.ts             # Push notification utilities
│           └── components/
│               └── ui/                 # UI components
└── packages/
    └── cli/                    # CLI package
        └── src/
            └── index.ts        # CLI implementation
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2+)
- [Convex CLI](https://docs.convex.dev/quickstart)
- [Clerk Account](https://clerk.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/finished.dev.git
cd finished.dev

# Install dependencies
bun install
```

### Environment Variables

Create `apps/web/.env.local`:

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Web Push (generate with: npx web-push generate-vapid-keys)
VITE_WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PRIVATE_KEY=...
WEB_PUSH_SUBJECT=mailto:your@email.com
```

### Development

```bash
# Terminal 1: Start Convex dev server
cd apps/web
npx convex dev

# Terminal 2: Start the web app
bun dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## CLI Usage

### Installation

```bash
# Global install
bun install -g @finished/cli

# Or run directly
bunx @finished/cli
```

### Commands

```bash
# Configure with your API key
finished init

# Send a notification
finished ping "Task completed"

# Send with status
finished ping "Build failed" --status failure

# Send with metadata
finished ping "Tests passed" --source cursor --duration 12345

# Test the connection
finished test

# Show configuration
finished status
```

### Integration Examples

```bash
# After a build
npm run build && finished ping "Build completed"

# In a script
python train.py && finished ping "Training finished" --duration $SECONDS

# With agents
claude "Review this code" && finished ping "Claude review done" --source claude
```

## API

### Webhook Endpoint

**POST** `/api/webhook/task`

**Headers:**
```
Authorization: Bearer fin_your_api_key
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Task name",
  "status": "success",
  "duration": 12345,
  "source": "claude",
  "machineId": "my-laptop",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "...",
  "message": "Task recorded successfully"
}
```

## Database Schema

| Table | Description |
|-------|-------------|
| `apiKeys` | User API keys for CLI authentication |
| `agentTasks` | Completed task records |
| `pushSubscriptions` | Browser push notification endpoints |
| `userSettings` | Notification preferences |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/sign-in` | Sign in |
| `/sign-up` | Sign up |
| `/dashboard` | Task feed |
| `/settings` | API keys & settings |

## Development Notes

### Generating VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### Convex Types

After running `npx convex dev`, types are generated in:
- `apps/web/convex/_generated/api.ts`
- `apps/web/convex/_generated/server.ts`

### TanStack Router Types

Run the dev server to regenerate route types in:
- `apps/web/src/routeTree.gen.ts`

## License

MIT
