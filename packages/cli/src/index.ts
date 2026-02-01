#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const VERSION = '0.2.2'
const DEFAULT_SERVER_URL = 'https://www.finished.dev'
const CONFIG_DIR = join(homedir(), '.finished')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const TRAILING_SLASH_RE = /\/$/

interface Config {
  apiKey: string
  serverUrl: string
  machineId?: string
}

const HELP = `
finished v${VERSION} - Agent Fleet Management CLI

Get Phone Push Notifications When Your Agents Finish Their Tasks.

USAGE:
  finished <command> [options]

COMMANDS:
  init              Configure your API key and server URL
  ping <message>    Send a task completion notification
  status            Show current configuration
  test              Test the connection to the server

OPTIONS:
  --server <url>    Server URL (default: ${DEFAULT_SERVER_URL})
  --source <name>   Source identifier (e.g., "claude", "cursor")
  --status <s>      Task status: success, failure, cancelled (default: success)
  --duration <ms>   Task duration in milliseconds
  --help, -h        Show this help message
  --version, -v     Show version

EXAMPLES:
  finished init
  finished ping "Code review completed"
  finished ping "Build failed" --status failure
  finished ping "Tests passed" --source cursor --duration 12345

SETUP:
  1. Sign up at ${DEFAULT_SERVER_URL}
  2. Go to Dashboard > Settings > API Keys
  3. Create a new API key
  4. Run: finished init
  5. Paste your API key when prompted

INTEGRATION:
  Add to your scripts or agent workflows:
    finished ping "Task name" && echo "Notification sent!"
`

function parseArgs(args: string[]): {
  command: string | null
  message: string | null
  server: string
  source: string | null
  status: string
  duration: number | null
  help: boolean
  version: boolean
} {
  const result = {
    command: null as string | null,
    message: null as string | null,
    server: DEFAULT_SERVER_URL,
    source: null as string | null,
    status: 'success',
    duration: null as number | null,
    help: false,
    version: false,
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      result.help = true
    } else if (arg === '--version' || arg === '-v') {
      result.version = true
    } else if (arg === '--server') {
      result.server = args[++i] || DEFAULT_SERVER_URL
    } else if (arg === '--source') {
      result.source = args[++i] || null
    } else if (arg === '--status') {
      result.status = args[++i] || 'success'
    } else if (arg === '--duration') {
      const dur = args[++i]
      result.duration = dur ? Number.parseInt(dur, 10) : null
    } else if (!arg.startsWith('-')) {
      if (!result.command) {
        result.command = arg
      } else if (!result.message) {
        result.message = arg
      }
    }
    i++
  }

  return result
}

function loadConfig(): Config | null {
  if (!existsSync(CONFIG_FILE)) {
    return null
  }
  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(content) as Config
  } catch {
    return null
  }
}

function saveConfig(config: Config): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

function normalizeServerUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'finished.dev') {
      parsed.hostname = 'www.finished.dev'
    }
    parsed.pathname = ''
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString().replace(TRAILING_SLASH_RE, '')
  } catch {
    return url
  }
}

function generateMachineId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}

async function promptInput(prompt: string): Promise<string> {
  process.stdout.write(prompt)
  const reader = Bun.stdin.stream().getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done || !value) {
      break
    }
    chunks.push(value)
    // Check for newline
    if (value.includes(10)) {
      break
    }
  }

  reader.releaseLock()
  const text = new TextDecoder().decode(Buffer.concat(chunks))
  return text.trim()
}

async function init(serverUrl: string): Promise<void> {
  console.log('\n🚀 finished CLI Setup\n')
  const normalizedServerUrl = normalizeServerUrl(serverUrl)
  console.log(`Server: ${normalizedServerUrl}`)
  console.log('')

  const apiKey = await promptInput('Enter your API key: ')

  if (!apiKey) {
    console.error('❌ API key is required')
    process.exit(1)
  }

  if (!apiKey.startsWith('fin_')) {
    console.error('❌ Invalid API key format. Keys should start with "fin_"')
    process.exit(1)
  }

  const config: Config = {
    apiKey,
    serverUrl: normalizedServerUrl,
    machineId: generateMachineId(),
  }

  saveConfig(config)
  console.log('\n✅ Configuration saved to ~/.finished/config.json')
  console.log(`   Machine ID: ${config.machineId}`)
  console.log('\nTest your setup:')
  console.log('  finished test')
  console.log('\nSend your first notification:')
  console.log('  finished ping "Hello from finished CLI"')
}

async function ping(
  message: string,
  options: {
    source: string | null
    status: string
    duration: number | null
  }
): Promise<void> {
  const config = loadConfig()
  if (!config) {
    console.error('❌ Not configured. Run: finished init')
    process.exit(1)
  }

  const payload: Record<string, string | number | undefined> = {
    title: message,
    status: options.status,
    machineId: config.machineId,
  }

  // Only include optional fields if they have values
  if (options.source) {
    payload.source = options.source
  }
  if (options.duration) {
    payload.duration = options.duration
  }

  const maxRetries = 3
  const backoffMs = 1000
  const serverUrl = normalizeServerUrl(config.serverUrl)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = `${serverUrl}/api/webhook/task`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await response.json()
        console.log(`✅ ${message}`)
        return
      }

      const error = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >
      if (response.status === 401) {
        console.error(
          `❌ Authentication failed: ${error.error || 'Invalid API key'}`
        )
        console.error('   Run "finished init" to reconfigure')
        process.exit(1)
      }

      if (response.status >= 400 && response.status < 500) {
        console.error(`❌ Request error: ${error.error || response.statusText}`)
        process.exit(1)
      }

      // Server error, retry
      throw new Error(`Server error: ${response.status}`)
    } catch (_error) {
      if (attempt < maxRetries) {
        const delay = backoffMs * attempt
        console.warn(
          `⚠️  Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`
        )
        await new Promise((r) => setTimeout(r, delay))
      } else {
        // Final attempt failed - warn but don't block
        console.warn(`⚠️  Could not reach server after ${maxRetries} attempts`)
        console.warn(`   Task: ${message}`)
        console.warn(
          '   The notification was not sent, but your task continues.'
        )
        // Exit 0 to not break CI/scripts
        process.exit(0)
      }
    }
  }
}

async function testConnection(): Promise<void> {
  const config = loadConfig()
  if (!config) {
    console.error('❌ Not configured. Run: finished init')
    process.exit(1)
  }

  const serverUrl = normalizeServerUrl(config.serverUrl)
  console.log(`\n🔍 Testing connection to ${serverUrl}...\n`)

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${serverUrl}/api/health`)
    if (healthResponse.ok) {
      console.log('✅ Server is reachable')
    } else {
      console.error('❌ Server returned error:', healthResponse.status)
      process.exit(1)
    }

    // Test API key
    const testResponse = await fetch(`${serverUrl}/api/webhook/task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        title: '[Test] Connection test from CLI',
        status: 'success',
        source: 'cli-test',
        machineId: config.machineId,
      }),
    })

    if (testResponse.ok) {
      console.log('✅ API key is valid')
      console.log('✅ Test notification sent!')
      console.log(
        '\n🎉 Everything is working! You should receive a push notification.'
      )
    } else {
      const error = (await testResponse.json().catch(() => ({}))) as Record<
        string,
        unknown
      >
      console.error(
        '❌ API key validation failed:',
        error.error || testResponse.statusText
      )
      process.exit(1)
    }
  } catch (error) {
    console.error(
      '❌ Connection failed:',
      error instanceof Error ? error.message : error
    )
    process.exit(1)
  }
}

function showStatus(): void {
  const config = loadConfig()
  if (!config) {
    console.log('\n⚠️  Not configured')
    console.log('   Run: finished init')
    return
  }

  const serverUrl = normalizeServerUrl(config.serverUrl)
  console.log('\n📋 Current Configuration\n')
  console.log(`   Server:     ${serverUrl}`)
  console.log(`   API Key:    ${config.apiKey.substring(0, 12)}...`)
  console.log(`   Machine ID: ${config.machineId || 'not set'}`)
  console.log(`   Config:     ${CONFIG_FILE}`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const parsed = parseArgs(args)

  if (parsed.help || !(parsed.command || parsed.version)) {
    console.log(HELP)
    process.exit(0)
  }

  if (parsed.version) {
    console.log(`finished v${VERSION}`)
    process.exit(0)
  }

  switch (parsed.command) {
    case 'init':
      await init(parsed.server)
      break

    case 'ping':
      if (!parsed.message) {
        console.error('❌ Message is required')
        console.error('   Usage: finished ping "Your message"')
        process.exit(1)
      }
      await ping(parsed.message, {
        source: parsed.source,
        status: parsed.status,
        duration: parsed.duration,
      })
      break

    case 'test':
      await testConnection()
      break

    case 'status':
      showStatus()
      break

    default:
      console.error(`❌ Unknown command: ${parsed.command}`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
