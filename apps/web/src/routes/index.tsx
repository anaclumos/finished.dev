import { createFileRoute } from '@tanstack/react-router'
import { ComponentExample } from '@/components/component-example'
import { StatusManager } from '@/components/status-manager'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="space-y-8">
      <ComponentExample />
      <StatusManager />
    </div>
  )
}
