type ThinkingLogProps = {
  entries: string[]
}

export function ThinkingLog({ entries }: ThinkingLogProps) {
  if (!entries.length) {
    return null
  }

  return (
    <details className="group mt-3 overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/8 text-sm shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold tracking-[0.22em] text-fuchsia-900 uppercase marker:hidden dark:text-fuchsia-100">
        <span className="flex items-center justify-between gap-3">
          <span>Thinking...</span>
          <span className="text-[10px] text-fuchsia-700/80 transition-transform group-open:rotate-180 dark:text-fuchsia-200/70">
            Expand
          </span>
        </span>
      </summary>
      <div className="border-t border-fuchsia-400/20 bg-white/45 px-4 py-3 dark:bg-slate-950/25">
        <pre className="overflow-x-auto whitespace-pre-wrap break-words border-l-2 border-fuchsia-400/45 pl-3 font-mono text-xs leading-6 text-[rgb(var(--text-secondary))]">
          {entries.join('\n\n')}
        </pre>
      </div>
    </details>
  )
}
