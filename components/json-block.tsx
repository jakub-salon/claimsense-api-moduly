"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

function highlight(json: string) {
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;")
  return escaped
    .replace(
      /("(?:\\.|[^"\\])*")(\s*:)/g,
      '<span class="text-[#ffb0a3]">$1</span>$2',
    )
    .replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span class="text-[#d6e2ff]">$1</span>',
    )
}

export function JsonBlock({
  value,
  title,
}: {
  value: unknown
  title: string
}) {
  const text = JSON.stringify(value, null, 2)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-sm border border-black/10 bg-[#141414]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <p className="font-tosh text-xs font-medium tracking-wide text-[#ffb0a3] uppercase">
          {title}
        </p>
        <Button
          variant="ghost"
          size="xs"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={copy}
        >
          {copied ? "Zkopírováno" : "Zkopírovat"}
        </Button>
      </div>
      <pre
        className="max-h-[440px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-[#f2f2f3]"
        dangerouslySetInnerHTML={{ __html: highlight(text) }}
      />
    </div>
  )
}
