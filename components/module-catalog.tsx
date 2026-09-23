"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ApiModule } from "@/lib/types"
import { industries, processes, industryLabel, type IndustryId } from "@/lib/taxonomy"

export function ModuleCatalog({
  modules,
  initialIndustry = "all",
}: {
  modules: ApiModule[]
  initialIndustry?: IndustryId | "all"
}) {
  const [query, setQuery] = useState("")
  const [industry, setIndustry] = useState<IndustryId | "all">(initialIndustry)

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("odvetvi")
    if (param && industries.some((item) => item.id === param)) {
      setIndustry(param as IndustryId)
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("cs")
    return modules.filter((item) => {
      if (industry !== "all" && !item.industries.includes(industry)) return false
      if (!needle) return true
      const haystack = [
        item.title,
        item.summary,
        item.apiName,
        item.path,
        ...item.documents.map((doc) => doc.name),
        ...item.industries.map((id) => industryLabel(id)),
      ]
        .join(" ")
        .toLocaleLowerCase("cs")
      return haystack.includes(needle)
    })
  }, [industry, modules, query])

  return (
    <div>
      <div className="flex flex-col gap-4 border border-black/10 bg-white p-4 sm:p-5">
        <label className="block">
          <span className="font-tosh text-xs font-medium tracking-[0.14em] text-[#002870] uppercase">
            Hledat
          </span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Například VIN, akreditiv, CMR, spoluúčast"
            className="mt-2 h-11 rounded-sm border-[#d8d8d9] bg-white px-3"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Odvětví">
          <FilterChip
            active={industry === "all"}
            onClick={() => setIndustry("all")}
            label="Všechna odvětví"
          />
          {industries.map((item) => (
            <FilterChip
              key={item.id}
              active={industry === item.id}
              onClick={() => setIndustry(item.id)}
              label={item.label}
            />
          ))}
        </div>
        <p className="text-sm text-[#666]">
          {filtered.length === 0
            ? "Nic neodpovídá."
            : filtered.length === 1
              ? "1 modul"
              : filtered.length < 5
                ? `${filtered.length} moduly`
                : `${filtered.length} modulů`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#002870]/30 bg-[#f2f2f3] px-5 py-10">
          <h2 className="font-tosh text-2xl font-medium tracking-tight">
            Žádný modul neodpovídá filtru
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#444]">
            Zkuste jiné odvětví, nebo smažte hledaný text. Katalog obsahuje
            pojišťovnu, banku, dopravce a tři další odvětví se stejnou smyčkou
            kontroly podkladů.
          </p>
          <Button
            variant="outline"
            className="font-tosh mt-5"
            onClick={() => {
              setQuery("")
              setIndustry("all")
            }}
          >
            Zobrazit celý katalog
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {processes.map((process) => {
            const items = filtered.filter((item) => item.process === process.id)
            if (items.length === 0) return null
            return (
              <section key={process.id} aria-labelledby={`process-${process.id}`}>
                <div className="mb-4 max-w-2xl">
                  <h2
                    id={`process-${process.id}`}
                    className="font-tosh text-2xl font-medium tracking-tight"
                  >
                    {process.label}
                  </h2>
                  <p className="mt-1 text-sm text-[#666]">{process.dek}</p>
                </div>
                <ul className="grid gap-3 md:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/moduly/${item.slug}`}
                        className="group flex h-full flex-col border border-black/10 bg-white p-4 transition-colors hover:border-[#ff5539]"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="rounded-sm font-mono text-[11px]">
                            POST
                          </Badge>
                          <span className="font-mono text-[12px] text-[#002870]">
                            {item.apiName}
                          </span>
                        </div>
                        <h3 className="font-tosh mt-3 text-xl font-medium tracking-tight group-hover:text-[#ff5539]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#444]">
                          {item.summary}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.industries.map((id) => (
                            <span
                              key={id}
                              className="bg-[#f2f2f3] px-2 py-0.5 text-[11px] tracking-wide text-[#002870] uppercase"
                            >
                              {industryLabel(id)}
                            </span>
                          ))}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "font-tosh cursor-pointer border-2 border-[#ff5539] bg-[#ff5539] px-3 py-1.5 text-sm text-white"
          : "font-tosh cursor-pointer border-2 border-[#002870] bg-white px-3 py-1.5 text-sm text-[#002870] hover:border-[#ff5539] hover:text-black"
      }
    >
      {label}
    </button>
  )
}
