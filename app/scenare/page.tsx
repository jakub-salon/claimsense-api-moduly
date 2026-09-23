import type { Metadata } from "next"
import Link from "next/link"
import { scenarios } from "@/lib/scenarios"
import { industryLabel } from "@/lib/taxonomy"
import { getModule } from "@/lib/modules"

export const metadata: Metadata = {
  title: "Scénáře",
  description:
    "Tři ukázkové likvidace: havarijní škoda, akreditiv a přepravní škoda podle CMR.",
}

export default function ScenariosPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <p className="font-tosh text-xs font-medium tracking-[0.16em] text-[#002870] uppercase">
        Scénáře
      </p>
      <h1 className="font-tosh mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
        Od požadavku k zápisu do systému
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#333]">
        Každý scénář je jeden modul v chodu. Volající systém pošle požadavek,
        agent srovná určené dokumenty, nesoulady se ukážou vedle sebe a odpověď
        se zapíše zpátky. Nic z toho nejde do ostrého API.
      </p>
      <ul className="mt-8 grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const moduleDef = getModule(scenario.moduleSlug)
          return (
            <li key={scenario.slug}>
              <Link
                href={`/scenare/${scenario.slug}`}
                className="flex h-full flex-col border border-black/10 p-5 hover:border-[#ff5539]"
              >
                <p className="text-[11px] tracking-wide text-[#002870] uppercase">
                  {industryLabel(scenario.industry)} · {scenario.caller.system}
                </p>
                <h2 className="font-tosh mt-3 text-2xl font-medium tracking-tight">
                  {scenario.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#444]">{scenario.dek}</p>
                {moduleDef ? (
                  <p className="mt-4 font-mono text-xs text-[#666]">{moduleDef.apiName}</p>
                ) : null}
                <span className="font-tosh mt-4 text-sm text-[#ff5539]">Spustit scénář ›</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
