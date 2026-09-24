"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CrossCheckVariable } from "@/lib/types"

const emptyVariable = (): CrossCheckVariable => ({
  id: `var-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  sourceDocument: "",
  sourceField: "",
  targetDocument: "",
  targetField: "",
})

function documentOptions(documents: string[], current: string) {
  const names = current && !documents.includes(current) ? [current, ...documents] : documents
  return names
}

export function CrossCheckVariables({
  documents,
  initial,
}: {
  documents: string[]
  initial: CrossCheckVariable[]
}) {
  const [rows, setRows] = useState(initial)

  function update(id: string, patch: Partial<CrossCheckVariable>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function add() {
    const next = emptyVariable()
    setRows((current) => [...current, next])
    window.requestAnimationFrame(() => {
      document.getElementById(`variable-name-${next.id}`)?.focus()
    })
  }

  function remove(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  return (
    <section className="mt-10" aria-labelledby="cross-variables-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 id="cross-variables-heading" className="font-tosh text-2xl font-medium tracking-tight">
            Proměnné křížové kontroly
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
            Určete, co se má vzít z kterého dokumentu a proti jakému poli se to má srovnat.
            Agent pak kontroluje jen tyto proměnné. Úpravy zůstanou v tomto okně.
          </p>
        </div>
        <Button type="button" onClick={add} className="font-tosh w-full shrink-0 sm:w-auto">
          Přidat proměnnou
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 border border-dashed border-black/20 bg-[#f2f2f3] px-4 py-6 text-sm leading-relaxed text-[#444]">
          Zatím tu není žádná proměnná. Přidejte, které pole z kterého dokumentu se má srovnat.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3" data-variable-count={rows.length}>
          <li className="hidden gap-2 px-3 text-[11px] tracking-wide text-[#666] uppercase lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_5.5rem]">
            <span>Název</span>
            <span>Zdrojový dokument</span>
            <span>Pole</span>
            <span>Proti dokumentu</span>
            <span>Pole</span>
            <span className="sr-only">Akce</span>
          </li>
          {rows.map((row, index) => (
            <li
              key={row.id}
              data-cross-variable={row.id}
              className="border border-black/10 bg-white p-3 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)_5.5rem] lg:items-end lg:gap-2 lg:border-0 lg:p-0"
            >
              <Field label="Název" hideLabelOnDesktop>
                <Input
                  id={`variable-name-${row.id}`}
                  value={row.name}
                  placeholder="Například VIN vozidla"
                  aria-label={`Název proměnné ${index + 1}`}
                  onChange={(event) => update(row.id, { name: event.target.value })}
                  className="h-10 rounded-sm border-black/15 bg-white"
                />
              </Field>
              <Field label="Zdrojový dokument" hideLabelOnDesktop>
                <DocumentSelect
                  documents={documents}
                  value={row.sourceDocument}
                  aria-label={`Zdrojový dokument proměnné ${index + 1}`}
                  onChange={(sourceDocument) => update(row.id, { sourceDocument })}
                />
              </Field>
              <Field label="Pole ve zdroji" hideLabelOnDesktop>
                <Input
                  value={row.sourceField}
                  placeholder="Pole"
                  aria-label={`Pole ve zdroji u proměnné ${index + 1}`}
                  onChange={(event) => update(row.id, { sourceField: event.target.value })}
                  className="h-10 rounded-sm border-black/15 bg-white"
                />
              </Field>
              <Field label="Proti dokumentu" hideLabelOnDesktop>
                <DocumentSelect
                  documents={documents}
                  value={row.targetDocument}
                  aria-label={`Cílový dokument proměnné ${index + 1}`}
                  onChange={(targetDocument) => update(row.id, { targetDocument })}
                />
              </Field>
              <Field label="Pole v cíli" hideLabelOnDesktop>
                <Input
                  value={row.targetField}
                  placeholder="Pole"
                  aria-label={`Pole v cíli u proměnné ${index + 1}`}
                  onChange={(event) => update(row.id, { targetField: event.target.value })}
                  className="h-10 rounded-sm border-black/15 bg-white"
                />
              </Field>
              <div className="mt-3 lg:mt-0">
                <Button
                  type="button"
                  variant="outline"
                  className="font-tosh h-10 w-full px-2 text-sm"
                  onClick={() => remove(row.id)}
                >
                  Odebrat
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Field({
  label,
  hideLabelOnDesktop,
  children,
}: {
  label: string
  hideLabelOnDesktop?: boolean
  children: ReactNode
}) {
  return (
    <label className="mt-3 block min-w-0 first:mt-0 lg:mt-0">
      <span className={hideLabelOnDesktop ? "mb-1 block text-[11px] tracking-wide text-[#666] uppercase lg:sr-only" : "mb-1 block text-[11px] tracking-wide text-[#666] uppercase"}>
        {label}
      </span>
      {children}
    </label>
  )
}

function DocumentSelect({
  documents,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  documents: string[]
  value: string
  onChange: (value: string) => void
  "aria-label": string
}) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full min-w-0 rounded-sm border border-black/15 bg-white px-2 text-sm text-[#1a1a1a] outline-none focus-visible:border-[#ff5539] focus-visible:ring-3 focus-visible:ring-[#ff5539]/40"
    >
      <option value="">Vyberte dokument</option>
      {documentOptions(documents, value).map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  )
}
