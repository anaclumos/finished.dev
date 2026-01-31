import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'
import { spawn } from 'bun'

const CLI_PATH = join(import.meta.dir, 'index.ts')

async function runCLI(args: string[], env?: Record<string, string>) {
  const proc = spawn(['bun', CLI_PATH, ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      ...env,
    },
  })

  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()

  return { exitCode, stdout, stderr, output: stdout + stderr }
}

describe('CLI Smoke Tests', () => {
  describe('Help Flag', () => {
    test('--help shows help text and exits 0', async () => {
      const { output, exitCode } = await runCLI(['--help'])

      expect(output).toContain('finished v')
      expect(output).toContain('USAGE:')
      expect(output).toContain('COMMANDS:')
      expect(output).toContain('init')
      expect(output).toContain('ping')
      expect(exitCode).toBe(0)
    })

    test('-h shows help text and exits 0', async () => {
      const { output, exitCode } = await runCLI(['-h'])

      expect(output).toContain('finished v')
      expect(output).toContain('USAGE:')
      expect(exitCode).toBe(0)
    })

    test('no arguments shows help text', async () => {
      const { output, exitCode } = await runCLI([])

      expect(output).toContain('finished v')
      expect(output).toContain('USAGE:')
      expect(exitCode).toBe(0)
    })
  })

  describe('Version Flag', () => {
    test('--version shows version and exits 0', async () => {
      const { output, exitCode } = await runCLI(['--version'])

      expect(output.trim()).toBe('finished v0.2.0')
      expect(exitCode).toBe(0)
    })

    test('-v shows version and exits 0', async () => {
      const { output, exitCode } = await runCLI(['-v'])

      expect(output.trim()).toBe('finished v0.2.0')
      expect(exitCode).toBe(0)
    })
  })

  describe('Command Parsing', () => {
    test('ping command without message shows error', async () => {
      const { output, exitCode } = await runCLI(['ping'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Message is required')
      expect(exitCode).toBe(1)
    })

    test('ping command without config shows error', async () => {
      const { output, exitCode } = await runCLI(['ping', 'test message'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
      expect(output).toContain('finished init')
      expect(exitCode).toBe(1)
    })

    test('test command without config shows error', async () => {
      const { output, exitCode } = await runCLI(['test'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
      expect(output).toContain('finished init')
      expect(exitCode).toBe(1)
    })

    test('unknown command shows error', async () => {
      const { output, exitCode } = await runCLI(['unknown'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Unknown command')
      expect(exitCode).toBe(1)
    })
  })

  describe('Status Command', () => {
    test('status command shows not configured message when no config', async () => {
      const { output, exitCode } = await runCLI(['status'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
      expect(output).toContain('finished init')
      expect(exitCode).toBe(0)
    })
  })

  describe('Options Parsing', () => {
    test('--server option is parsed', async () => {
      const { output } = await runCLI(
        ['ping', 'msg', '--server', 'https://custom.dev'],
        {
          HOME: '/tmp/finished-test-no-config',
        }
      )

      expect(output).toContain('Not configured')
    })

    test('--source option is parsed', async () => {
      const { output } = await runCLI(['ping', 'msg', '--source', 'claude'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
    })

    test('--status option is parsed', async () => {
      const { output } = await runCLI(['ping', 'msg', '--status', 'failure'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
    })

    test('--duration option is parsed', async () => {
      const { output } = await runCLI(['ping', 'msg', '--duration', '5000'], {
        HOME: '/tmp/finished-test-no-config',
      })

      expect(output).toContain('Not configured')
    })

    test('multiple options are parsed together', async () => {
      const { output } = await runCLI(
        [
          'ping',
          'Build done',
          '--source',
          'jenkins',
          '--status',
          'success',
          '--duration',
          '12345',
        ],
        {
          HOME: '/tmp/finished-test-no-config',
        }
      )

      expect(output).toContain('Not configured')
    })
  })
})
