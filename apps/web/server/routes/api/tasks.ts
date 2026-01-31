import { defineEventHandler } from 'h3'

const recordedTasks: Array<{
  id: string
  title: string
  status: string
  source?: string
  createdAt: string
}> = []

export default defineEventHandler(async () => {
  return { tasks: recordedTasks }
})

export function recordTask(task: {
  title: string
  status: string
  source?: string
}) {
  recordedTasks.push({
    id: `task-${Date.now()}`,
    title: task.title,
    status: task.status,
    source: task.source,
    createdAt: new Date().toISOString(),
  })
}
