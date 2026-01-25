import { highlight } from 'sugar-high'

interface CodeBlockProps {
  code: string
  title?: string
}

const sharedHighlightStyles =
  '[&_.sh-class]:text-yellow-300 [&_.sh-comment]:text-zinc-500 [&_.sh-identifier]:text-zinc-300 [&_.sh-keyword]:text-purple-400 [&_.sh-property]:text-blue-400 [&_.sh-sign]:text-zinc-400 [&_.sh-string]:text-green-400'

export function CodeBlock({ code, title = 'Terminal' }: CodeBlockProps) {
  const html = highlight(code)

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-1 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-zinc-700 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-zinc-500">{title}</span>
      </div>
      <pre
        className={`p-4 text-left font-mono text-sm text-zinc-300 ${sharedHighlightStyles}`}
      >
        {/* eslint-disable-next-line react/no-danger -- sugar-high output is sanitized */}
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}

interface InlineCodeProps {
  children: string
}

export function InlineCode({ children }: InlineCodeProps) {
  const html = highlight(children)

  return (
    <code
      className={`mt-4 block rounded bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300 ${sharedHighlightStyles}`}
      // eslint-disable-next-line react/no-danger -- sugar-high output is sanitized
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
