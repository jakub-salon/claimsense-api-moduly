import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ScenarioRunner } from "@/components/scenario-runner"
import { getModule } from "@/lib/modules"
import { getScenario, scenarios } from "@/lib/scenarios"
import { industryLabel } from "@/lib/taxonomy"

export function generateStaticParams() {
  return scenarios.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const scenario = getScenario(slug)
  if (!scenario) return { title: "Scénář" }
  return { title: scenario.title, description: scenario.dek }
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scenario = getScenario(slug)
  if (!scenario) notFound()
  const moduleDef = getModule(scenario.moduleSlug)
  if (!moduleDef) notFound()

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:py-10">
      <p className="text-sm text-[#666]">
        <Link href="/scenare" className="hover:text-[#ff5539]">
          Scénáře
        </Link>
        <span className="px-2">/</span>
        {industryLabel(scenario.industry)}
      </p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-tosh text-3xl font-black tracking-tight md:text-5xl">
            {scenario.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#333]">{scenario.dek}</p>
        </div>
        <Link
          href={`/moduly/${moduleDef.slug}`}
          className="shrink-0 border border-[#002870] px-3 py-2 text-sm text-[#002870] hover:border-[#ff5539] hover:text-black"
        >
          Modul {moduleDef.apiName}
        </Link>
      </div>
      <div className="mt-8">
        <ScenarioRunner scenario={scenario} apiPath={moduleDef.path} />
      </div>
    </div>
  )
}
