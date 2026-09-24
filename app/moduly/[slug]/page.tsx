import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonBlock } from "@/components/json-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CrossCheckVariables } from "@/components/cross-check-variables"
import { crossCheckVariablesFor } from "@/lib/cross-check-variables"
import { getModule, modules } from "@/lib/modules"
import { industryLabel, processById } from "@/lib/taxonomy"

export function generateStaticParams() {
  return modules.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const moduleDef = getModule(slug)
  if (!moduleDef) return { title: "Modul" }
  return {
    title: moduleDef.title,
    description: moduleDef.summary,
  }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const moduleDef = getModule(slug)
  if (!moduleDef) notFound()
  const process = processById(moduleDef.process)
  const variables = crossCheckVariablesFor(moduleDef.slug)
  const related = (moduleDef.relatedSlugs ?? [])
    .map((relatedSlug) => getModule(relatedSlug))
    .filter((item) => item !== undefined)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <p className="text-sm text-[#666]">
        <Link href="/moduly" className="hover:text-[#ff5539]">
          Katalog
        </Link>
        <span className="px-2">/</span>
        {process.label}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="rounded-sm font-mono">{moduleDef.method}</Badge>
        <span className="font-mono text-sm text-[#002870]">{moduleDef.apiName}</span>
      </div>
      <h1 className="font-tosh mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
        {moduleDef.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#333]">{moduleDef.summary}</p>
      <p className="mt-3 font-mono text-sm text-[#666]">{moduleDef.path}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {moduleDef.industries.map((id) => (
          <Link
            key={id}
            href={`/moduly?odvetvi=${id}`}
            className="bg-[#f2f2f3] px-2 py-1 text-[11px] tracking-wide text-[#002870] uppercase hover:text-[#ff5539]"
          >
            {industryLabel(id)}
          </Link>
        ))}
      </div>

      {moduleDef.scenarioSlug ? (
        <div className="mt-6 flex flex-col gap-3 border border-[#ff5539] bg-[#fff1ee] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed">
            U tohoto modulu je průchozí scénář: požadavek, kontrola dokumentů, nesoulady a zápis zpátky.
          </p>
          <Button
            nativeButton={false}
            render={<Link href={`/scenare/${moduleDef.scenarioSlug}`} />}
            className="font-tosh shrink-0"
          >
            Spustit scénář
          </Button>
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-tosh text-2xl font-medium tracking-tight">Kdo volá</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#333]">{moduleDef.caller}</p>
        </section>
        <section>
          <h2 className="font-tosh text-2xl font-medium tracking-tight">Proč vlastní API</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#333]">{moduleDef.whySeparate}</p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-tosh text-2xl font-medium tracking-tight">Dokumenty na vstupu</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {moduleDef.documents.map((document) => (
            <li key={document.name} className="border border-black/10 p-4">
              <h3 className="font-tosh text-base font-medium">{document.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#444]">{document.role}</p>
            </li>
          ))}
        </ul>
      </section>

      {variables ? (
        <CrossCheckVariables
          documents={moduleDef.documents.map((document) => document.name)}
          initial={variables}
        />
      ) : null}

      <section className="mt-10">
        <h2 className="font-tosh text-2xl font-medium tracking-tight">Co agent křížově kontroluje</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {moduleDef.checks.map((check) => (
            <li key={check} className="border-l-4 border-[#ff5539] bg-[#f2f2f3] px-3 py-2 text-sm leading-relaxed">
              {check}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-tosh text-2xl font-medium tracking-tight">Co se vrací</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
          Obálka je u všech modulů stejná: traceId, module, outcome, recommendedAction,
          discrepancies. Tělo v result se liší, protože ho čte jiný systém.
        </p>
        <dl className="mt-4 divide-y divide-black/10 border border-black/10">
          {moduleDef.resultFields.map((field) => (
            <div key={field.field} className="grid gap-1 px-4 py-3 md:grid-cols-[16rem_1fr]">
              <dt className="font-mono text-xs text-[#002870]">{field.field}</dt>
              <dd className="text-sm leading-relaxed">{field.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-tosh text-2xl font-medium tracking-tight">Příklad kontraktu</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
          Názvy polí jsou anglicky, aby kontrakt držel napříč zeměmi. Obrazovka
          likvidátora zůstává česky — mapování dělá volající systém.
        </p>
        <Tabs defaultValue="request" className="mt-4">
          <TabsList variant="line">
            <TabsTrigger value="request">Požadavek</TabsTrigger>
            <TabsTrigger value="response">Odpověď</TabsTrigger>
          </TabsList>
          <TabsContent value="request" className="mt-3">
            <JsonBlock value={moduleDef.request} title={`POST ${moduleDef.path}`} />
          </TabsContent>
          <TabsContent value="response" className="mt-3">
            <JsonBlock value={moduleDef.response} title="200 application/json" />
          </TabsContent>
        </Tabs>
      </section>

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-tosh text-2xl font-medium tracking-tight">Vedlejší kroky</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/moduly/${item.slug}`}
                  className="block border border-black/10 p-4 hover:border-[#ff5539]"
                >
                  <p className="font-mono text-xs text-[#002870]">{item.apiName}</p>
                  <p className="font-tosh mt-1 text-lg font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-[#444]">{item.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
