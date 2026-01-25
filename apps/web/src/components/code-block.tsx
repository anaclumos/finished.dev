import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
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
      theme: 'github-dark',
    }).then(setHtml)
  }, [code, lang])

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-1 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-zinc-700 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500">{title}</span>
      </div>
      {html ? (
        <div
          className="overflow-x-auto p-4 text-left font-mono text-sm [&_pre]:!bg-transparent [&_code]:!bg-transparent"
          // eslint-disable-next-line react/no-danger -- shiki output is sanitized
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
      theme: 'github-dark',
    }).then(setHtml)
  }, [children, lang])

  if (html) {
    return (
      <div
        className="mt-4 block overflow-x-auto rounded bg-zinc-900 px-3 py-2 font-mono text-sm [&_pre]:!m-0 [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        // eslint-disable-next-line react/no-danger -- shiki output is sanitized
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
