import type { Metadata } from "next"
import { ModuleCatalog } from "@/components/module-catalog"
import { modules } from "@/lib/modules"
export const metadata: Metadata = {
  title: "Katalog modulů",
  description:
    "API moduly ClaimSense podle kroku likvidace a odvětví: pojišťovna, banka, dopravce, zdravotnictví, telekomunikace, energetika.",
}

export default function ModulesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <p className="font-tosh text-xs font-medium tracking-[0.16em] text-[#002870] uppercase">
        Katalog
      </p>
      <h1 className="font-tosh mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
        Moduly podle procesu a odvětví
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#333]">
        Každý modul je jedno volání. Likvidátor ho nespouští z obrazovky
        ClaimSense, ale ze systému, ve kterém už případ vede. Agent vrací
        nesoulady a čísla, ne esej.
      </p>
      <div className="mt-8">
        <ModuleCatalog modules={modules} />
      </div>
    </div>
  )
}
