import type { ReactNode } from "react"
import { ArrowDownToLine, Check, FileStack, ScanSearch, Send, X, type LucideIcon } from "lucide-react"
import type { Scenario } from "@/lib/types"

type Phase = "idle" | "running" | "done" | "error"
type StepState = "waiting" | "ready" | "active" | "done" | "failed"

function plural(count: number, one: string, few: string, many: string) {
  if (count === 1) return `${count} ${one}`
  if (count >= 2 && count <= 4) return `${count} ${few}`
  return `${count} ${many}`
}

const markerClass: Record<StepState, string> = {
  waiting: "border-black/15 bg-white text-[#999]",
  ready: "border-[#002870] bg-white text-[#002870]",
  active: "border-[#ff5539] bg-[#fff1ee] text-[#ff5539]",
  done: "border-[#002870] bg-[#002870] text-white",
  failed: "border-[#9f1d1d] bg-[#9f1d1d] text-white",
}

const stateLabel: Record<StepState, string> = {
  waiting: "Čeká",
  ready: "Připraveno",
  active: "Probíhá",
  done: "Hotovo",
  failed: "Selhalo",
}

const stateLabelClass: Record<StepState, string> = {
  waiting: "text-[#999]",
  ready: "text-[#002870]",
  active: "text-[#ff5539]",
  done: "text-[#002870]",
  failed: "text-[#9f1d1d]",
}

export function ScenarioProcess({
  scenario,
  apiPath,
  phase,
  visibleChecks,
}: {
  scenario: Scenario
  apiPath: string
  phase: Phase
  visibleChecks: number
}) {
  const system = scenario.caller.system
  const checkCount = scenario.checks.length
  const failedChecks = scenario.checks.filter((check) => check.status === "fail").length

  const states: StepState[] =
    phase === "idle"
      ? ["ready", "waiting", "waiting", "waiting"]
      : phase === "error"
        ? ["done", "failed", "waiting", "waiting"]
        : phase === "running"
          ? ["done", visibleChecks === 0 ? "active" : "done", visibleChecks === 0 ? "waiting" : "active", "waiting"]
          : ["done", "done", "done", "done"]

  return (
    <section aria-label="Průběh procesu" className="border border-black/10 bg-white p-4">
      <p className="font-tosh text-xs font-medium tracking-[0.14em] text-[#002870] uppercase">
        Co se v procesu děje
      </p>
      <ol className="mt-4">
        <Step
          icon={Send}
          state={states[0]}
          title={`${system} odešle volání`}
          detail={`${scenario.caller.actor} spustí kontrolu přímo z případu ${scenario.caller.recordId}.`}
        >
          <p className="font-mono text-[11px] text-[#666]">POST {apiPath}</p>
        </Step>
        <Step
          icon={FileStack}
          state={states[1]}
          title="Agent načte dokumenty ze spisu"
          detail={
            phase === "error"
              ? `API vrátilo HTTP ${scenario.error.status}. Agent se k dokumentům nedostal.`
              : `${system} pošle jen odkazy. Obsah ${plural(scenario.documents.length, "dokumentu", "dokumentů", "dokumentů")} si agent přečte sám.`
          }
        >
          <ul className="flex flex-wrap gap-1">
            {scenario.documents.map((document) => (
              <li key={document.id} className="bg-[#f2f2f3] px-1.5 py-0.5 text-[11px] text-[#444]">
                {document.name}
              </li>
            ))}
          </ul>
        </Step>
        <Step
          icon={ScanSearch}
          state={states[2]}
          title="Křížová kontrola"
          detail={
            phase === "done"
              ? `Prošlo ${checkCount - failedChecks} z ${checkCount}, ${plural(failedChecks, "kontrola nesedí", "kontroly nesedí", "kontrol nesedí")}.`
              : `Agent srovná stejné údaje napříč dokumenty — ${plural(checkCount, "kontrola", "kontroly", "kontrol")}.`
          }
        >
          <ul className="flex gap-1" aria-label="Stav jednotlivých kontrol">
            {scenario.checks.map((check, index) => {
              const shown = (phase === "running" || phase === "done") && index < visibleChecks
              const current = phase === "running" && index === visibleChecks
              const tone = shown
                ? check.status === "pass"
                  ? "bg-[#002870]"
                  : "bg-[#ff5539]"
                : current
                  ? "animate-pulse bg-[#ffb0a3]"
                  : "bg-[#e4e4e7]"
              return (
                <li
                  key={check.id}
                  title={shown ? `${check.label}: ${check.status === "pass" ? "sedí" : "nesedí"}` : check.label}
                  className={`h-1.5 flex-1 rounded-full ${tone}`}
                />
              )
            })}
          </ul>
        </Step>
        <Step
          icon={ArrowDownToLine}
          state={states[3]}
          title={`Výsledek se zapíše zpátky do ${scenario.caller.systemGenitive}`}
          detail={
            phase === "error"
              ? "Nic se nezapsalo. Případ zůstává, jak byl."
              : `${plural(scenario.discrepancies.length, "nesoulad", "nesoulady", "nesouladů")} s oběma hodnotami a doporučení, co dál. Likvidátor je uvidí na případu.`
          }
          last
        />
      </ol>
    </section>
  )
}

function Step({
  icon: Icon,
  state,
  title,
  detail,
  last,
  children,
}: {
  icon: LucideIcon
  state: StepState
  title: string
  detail: string
  last?: boolean
  children?: ReactNode
}) {
  const MarkerIcon = state === "done" ? Check : state === "failed" ? X : Icon
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0" data-process-step={state}>
      {last ? null : (
        <span
          aria-hidden
          className={`absolute top-9 bottom-1 left-[17px] w-0.5 ${state === "done" ? "bg-[#002870]" : "bg-black/10"}`}
        />
      )}
      <span
        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${markerClass[state]}`}
      >
        <MarkerIcon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-tosh text-sm font-medium">{title}</p>
          <span className={`shrink-0 text-[11px] tracking-wide uppercase ${stateLabelClass[state]}`}>
            {stateLabel[state]}
          </span>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-[#444]">{detail}</p>
        {children ? <div className="mt-2">{children}</div> : null}
      </div>
    </li>
  )
}
