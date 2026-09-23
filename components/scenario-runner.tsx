"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { JsonBlock } from "@/components/json-block"
import type { Scenario, Severity } from "@/lib/types"
import { industryLabel } from "@/lib/taxonomy"

type Phase = "idle" | "running" | "done" | "error"

const severityLabel: Record<Severity, string> = {
  high: "Vysoká",
  medium: "Střední",
  low: "Nízká",
}

export function ScenarioRunner({
  scenario,
  apiPath,
}: {
  scenario: Scenario
  apiPath: string
}) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [visibleChecks, setVisibleChecks] = useState(0)

  useEffect(() => {
    if (phase !== "running") return
    if (visibleChecks >= scenario.checks.length) {
      const timer = window.setTimeout(() => setPhase("done"), 450)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setVisibleChecks((count) => count + 1), 420)
    return () => window.clearTimeout(timer)
  }, [phase, scenario.checks.length, visibleChecks])

  const activeCheck =
    phase === "running" && visibleChecks < scenario.checks.length
      ? scenario.checks[visibleChecks]
      : undefined

  useEffect(() => {
    if (!activeCheck) return
    const id = activeCheck.documentIds[0]
    if (!id) return
    document.getElementById(`doc-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [activeCheck])
  const activeDocs = new Set(activeCheck?.documentIds ?? [])
  const revealed = scenario.checks.slice(0, phase === "running" || phase === "done" ? visibleChecks : 0)
  const showResult = phase === "done"

  function send() {
    setVisibleChecks(0)
    setPhase("running")
  }

  function fail() {
    setVisibleChecks(0)
    setPhase("error")
  }

  function reset() {
    setVisibleChecks(0)
    setPhase("idle")
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section
        aria-label="Volající systém"
        className="overflow-hidden border border-black/10 bg-white lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto"
      >
        <div className="flex items-center justify-between gap-3 bg-[#002870] px-4 py-3 text-white">
          <div>
            <p className="font-tosh text-sm font-medium">{scenario.caller.system}</p>
            <p className="text-xs text-white/75">{scenario.caller.product}</p>
          </div>
          <p className="font-mono text-[11px] text-[#ffb0a3]">{scenario.caller.recordId}</p>
        </div>
        <div className="border-b border-black/10 px-4 py-4">
          <p className="text-xs tracking-wide text-[#666] uppercase">Případ</p>
          <h2 className="font-tosh mt-1 text-xl font-medium tracking-tight">
            {scenario.caller.recordTitle}
          </h2>
          <p className="mt-1 text-sm text-[#444]">
            {scenario.caller.actor} · {scenario.caller.actorRole}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {scenario.recordFields.map((field) => (
              <div key={field.label}>
                <dt className="text-[11px] tracking-wide text-[#666] uppercase">{field.label}</dt>
                <dd className="mt-0.5 text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="px-4 py-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <p className="font-tosh text-sm font-medium">Výsledek z ClaimSense</p>
            {showResult ? (
              <span className="bg-[#fff1ee] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#9f1d1d] uppercase">
                Zapsáno
              </span>
            ) : null}
          </div>

          {phase === "idle" ? (
            <p className="mt-3 border border-dashed border-[#002870]/30 bg-[#f2f2f3] px-3 py-4 text-sm leading-relaxed text-[#444]">
              Do záznamu se zatím nic nezapsalo. Likvidátor výsledek uvidí tady,
              ve svém systému, až agent odpoví.
            </p>
          ) : null}

          {phase === "running" ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-sm bg-[#f2f2f3]" />
              <Skeleton className="h-4 w-full rounded-sm bg-[#f2f2f3]" />
              <Skeleton className="h-4 w-5/6 rounded-sm bg-[#f2f2f3]" />
              <p className="text-sm text-[#666]">Čeká se na odpověď API. Záznam se nemění.</p>
            </div>
          ) : null}

          {phase === "error" ? (
            <p className="mt-3 border border-[#9f1d1d]/30 bg-[#fff6f5] px-3 py-4 text-sm leading-relaxed">
              Zápis se neprovedl. {scenario.error.message}
            </p>
          ) : null}

          {showResult ? (
            <dl className="mt-3 divide-y divide-black/10 border border-[#ff5539]/40">
              {scenario.writeback.map((field) => (
                <div key={field.label} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[9rem_1fr]">
                  <dt className="text-[11px] tracking-wide text-[#666] uppercase">{field.label}</dt>
                  <dd className="text-sm">{field.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <section aria-label="Požadavek API" className="border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-tosh text-xs font-medium tracking-[0.14em] text-[#002870] uppercase">
                Volání
              </p>
              <p className="font-mono mt-1 text-sm text-black">
                POST {apiPath}
              </p>
            </div>
            <p className="text-xs text-[#666]">{industryLabel(scenario.industry)}</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#444]">
            {scenario.caller.system} posílá odkazy na dokumenty a údaje, které už
            v záznamu má. Obsah faktur a fotek agent čte sám.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              className="font-tosh px-4"
              onClick={send}
              disabled={phase === "running"}
            >
              {phase === "running" ? "Agent kontroluje podklady" : "Odeslat volání"}
            </Button>
            <Button
              variant="destructive"
              className="font-tosh px-4"
              onClick={fail}
              disabled={phase === "running"}
            >
              Simulovat nedostupnost
            </Button>
            {phase !== "idle" ? (
              <Button variant="ghost" className="font-tosh px-4" onClick={reset}>
                Vyčistit záznam
              </Button>
            ) : null}
          </div>
        </section>

        <JsonBlock value={scenario.request} title="Požadavek" />

        <section aria-label="Práce agenta" className="border border-black/10 bg-white p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-tosh text-lg font-medium tracking-tight">Co agent srovnává</h2>
            {phase === "running" ? (
              <p className="text-xs text-[#666]">
                {Math.min(visibleChecks, scenario.checks.length)} / {scenario.checks.length}
              </p>
            ) : null}
          </div>

          {phase === "idle" ? (
            <p className="mt-3 border border-dashed border-[#002870]/30 bg-[#f2f2f3] px-3 py-4 text-sm leading-relaxed text-[#444]">
              Agent ještě neběžel. Až odešlete volání, projde dokumenty jeden po
              druhém a nesoulady ukáže vedle sebe.
            </p>
          ) : null}

          {phase === "error" ? (
            <div className="mt-3 border border-[#9f1d1d]/40 bg-[#fff6f5] p-4">
              <p className="font-mono text-xs text-[#9f1d1d]">
                HTTP {scenario.error.status} · {scenario.error.code}
              </p>
              <p className="font-tosh mt-2 text-lg font-medium">Agent je nedostupný</p>
              <p className="mt-1 text-sm leading-relaxed">{scenario.error.message}</p>
              <p className="mt-2 font-mono text-[11px] text-[#666]">
                traceId {scenario.error.traceId}
              </p>
              <Button className="font-tosh mt-4" onClick={send}>
                Zkusit znovu
              </Button>
            </div>
          ) : null}

          {phase === "running" || phase === "done" ? (
            <ol className="mt-4 flex flex-col gap-2">
              {scenario.checks.map((check, index) => {
                const shown = index < visibleChecks
                const current = phase === "running" && index === visibleChecks
                return (
                  <li
                    key={check.id}
                    className={
                      shown
                        ? "border border-black/10 px-3 py-2"
                        : "border border-dashed border-black/10 px-3 py-2 text-[#999]"
                    }
                  >
                    {shown ? (
                      <div className="flex gap-2">
                        <span
                          className={
                            check.status === "pass"
                              ? "mt-0.5 text-xs font-medium text-[#002870]"
                              : "mt-0.5 text-xs font-medium text-[#ff5539]"
                          }
                        >
                          {check.status === "pass" ? "Sedí" : "Nesedí"}
                        </span>
                        <div>
                          <p className="text-sm">{check.label}</p>
                          <p className="mt-0.5 text-xs text-[#666]">{check.detail}</p>
                        </div>
                      </div>
                    ) : current ? (
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-3/4 rounded-sm" />
                        <p className="text-xs text-[#666]">Čtu podklady k této kontrole…</p>
                      </div>
                    ) : (
                      <p className="text-sm">Čeká ve frontě</p>
                    )}
                  </li>
                )
              })}
            </ol>
          ) : null}

          <div className="mt-4 grid gap-2">
            {scenario.documents.map((document) => {
              const hot = activeDocs.has(document.id)
              return (
                <article
                  key={document.id}
                  id={`doc-${document.id}`}
                  className={
                    hot
                      ? "border-2 border-[#ff5539] bg-[#fff1ee] px-3 py-3"
                      : "border border-black/10 px-3 py-3"
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium">{document.name}</h3>
                    <span className="text-[11px] tracking-wide text-[#002870] uppercase">
                      {document.kind}
                    </span>
                  </div>
                  <dl className="mt-2 grid gap-1 sm:grid-cols-2">
                    {document.fields.map((field) => (
                      <div key={field.label} className="min-w-0">
                        <dt className="text-[11px] text-[#666]">{field.label}</dt>
                        <dd
                          className={
                            showResult && field.conflict
                              ? "text-sm text-[#9f1d1d]"
                              : "text-sm"
                          }
                        >
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              )
            })}
          </div>
        </section>

        {showResult ? (
          <section aria-label="Nesoulady a odpověď" className="flex flex-col gap-4">
            <div className="border border-[#ff5539] bg-white p-4">
              <h2 className="font-tosh text-lg font-medium tracking-tight">
                Nesoulady, které se vrací do {scenario.caller.system}
              </h2>
              <ul className="mt-4 flex flex-col gap-4">
                {scenario.discrepancies.map((item) => (
                  <li key={item.id} className="border-l-4 border-[#ff5539] pl-3">
                    <p className="text-[11px] tracking-wide text-[#ff5539] uppercase">
                      {severityLabel[item.severity]}
                    </p>
                    <p className="font-tosh mt-1 text-base font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-[#444]">{item.detail}</p>
                    <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                      {item.rows.map((row) => (
                        <div key={row.source} className="bg-[#f2f2f3] px-2 py-2">
                          <dt className="text-[11px] text-[#666]">{row.source}</dt>
                          <dd className="text-sm">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
              {revealed.some((check) => check.status === "pass") ? (
                <p className="mt-4 text-sm text-[#444]">
                  Prošlo bez nálezu:{" "}
                  {revealed
                    .filter((check) => check.status === "pass")
                    .map((check) => check.label)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
            <JsonBlock value={scenario.response} title="Odpověď 200" />
            <p className="text-sm text-[#666]">
              Stejný kontrakt je popsán u modulu{" "}
              <Link href={`/moduly/${scenario.moduleSlug}`} className="text-[#002870] underline">
                {scenario.moduleSlug}
              </Link>
              .
            </p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
