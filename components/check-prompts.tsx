"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { defaultCheckPrompt } from "@/lib/check-prompts"

export function CheckPrompts({
  checks,
  documents,
}: {
  checks: string[]
  documents: string[]
}) {
  const defaults = checks.map((check) => defaultCheckPrompt(check, documents))
  const [prompts, setPrompts] = useState(defaults)

  function update(index: number, value: string) {
    setPrompts((current) => current.map((prompt, i) => (i === index ? value : prompt)))
  }

  return (
    <section className="mt-10" aria-labelledby="check-prompts-heading">
      <h2 id="check-prompts-heading" className="font-tosh text-2xl font-medium tracking-tight">
        Co agent křížově kontroluje
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
        Každá kontrola má vlastní prompt, podle kterého agent čte dokumenty. Upravte ho, když má
        kontrola hledat něco jiného nebo přísněji. Úpravy zůstanou v tomto okně.
      </p>
      <ol className="mt-4 flex flex-col gap-4">
        {checks.map((check, index) => {
          const changed = prompts[index] !== defaults[index]
          const promptId = `check-prompt-${index}`
          return (
            <li key={check} data-check-prompt={index} className="border-l-4 border-[#ff5539] bg-[#f2f2f3] p-3">
              <div className="flex items-start justify-between gap-3">
                <label htmlFor={promptId} className="text-sm leading-relaxed">
                  <span className="font-mono text-xs text-[#002870]">{String(index + 1).padStart(2, "0")}</span>{" "}
                  {check}
                </label>
                {changed ? (
                  <span className="shrink-0 bg-white px-2 py-0.5 text-[11px] tracking-wide text-[#ff5539] uppercase">
                    Upraveno
                  </span>
                ) : null}
              </div>
              <textarea
                id={promptId}
                value={prompts[index]}
                rows={6}
                spellCheck={false}
                onChange={(event) => update(index, event.target.value)}
                className="mt-3 block w-full resize-y rounded-sm border border-black/15 bg-white p-3 font-mono text-[12px] leading-relaxed text-[#1a1a1a] outline-none focus-visible:border-[#ff5539] focus-visible:ring-3 focus-visible:ring-[#ff5539]/40"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!changed}
                  onClick={() => update(index, defaults[index])}
                  className="font-tosh"
                >
                  Obnovit výchozí
                </Button>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
