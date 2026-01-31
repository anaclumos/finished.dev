import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
}

const shikiTheme = {
  name: 'terminal-yellow',
  type: 'dark' as const,
  colors: {
    'editor.background': 'transparent',
    'editor.foreground': '#d4d4d4',
  },
  settings: [
    { scope: ['comment'], settings: { foreground: '#71717a' } },
    { scope: ['string', 'string.quoted'], settings: { foreground: '#fcd34d' } },
    { scope: ['keyword', 'storage'], settings: { foreground: '#c084fc' } },
    {
      scope: ['variable', 'entity.name.function'],
      settings: { foreground: '#60a5fa' },
    },
    {
      scope: ['constant', 'constant.numeric'],
      settings: { foreground: '#f59e0b' },
    },
    {
      scope: ['entity.name', 'support.function'],
      settings: { foreground: '#fbbf24' },
    },
    {
      scope: ['punctuation', 'meta.brace'],
      settings: { foreground: '#a1a1aa' },
    },
  ],
}

export function CodeBlock({
  code,
  lang = 'bash',
  title = 'Terminal',
}: CodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    codeToHtml(code, {
      lang,
      theme: shikiTheme,
    }).then(setHtml)
  }, [code, lang])

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-1 shadow-2xl">
      <div className="flex items-center gap-1.5 border-zinc-700 border-b px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500">{title}</span>
      </div>
      {html ? (
        <div
          className="[&_pre]:!bg-transparent [&_code]:!bg-transparent overflow-x-auto p-4 text-left font-mono text-sm"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is sanitized
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="p-4 text-left font-mono text-sm text-zinc-300">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

interface InlineCodeProps {
  children: string
  lang?: string
}

export function InlineCode({ children, lang = 'bash' }: InlineCodeProps) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    codeToHtml(children, {
      lang,
      theme: shikiTheme,
    }).then(setHtml)
  }, [children, lang])

  if (html) {
    return (
      <div
        className="[&_pre]:!m-0 [&_pre]:!bg-transparent [&_code]:!bg-transparent mt-4 block overflow-x-auto rounded bg-zinc-900 px-3 py-2 font-mono text-sm"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is sanitized
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <code className="mt-4 block rounded bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300">
      {children}
    </code>
  )
}
