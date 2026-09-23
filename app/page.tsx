import Link from "next/link"
import { Button } from "@/components/ui/button"
import { modules } from "@/lib/modules"
import { scenarios } from "@/lib/scenarios"
import { industries, processes } from "@/lib/taxonomy"

export default function HomePage() {
  return (
    <div>
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:py-16">
          <div>
            <p className="font-tosh text-xs font-medium tracking-[0.16em] text-[#002870] uppercase">
              ClaimSense · API pro likvidaci
            </p>
            <h1 className="font-tosh mt-4 text-4xl leading-[1.05] font-black tracking-tight text-black md:text-6xl">
              Likvidátor zůstane ve svém systému.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#333]">
              Salesforce, core banking nebo TMS pošle dokumenty na jedno API.
              Agent srovná fakta napříč podklady a výsledek zapíše zpátky do
              stejného záznamu.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                nativeButton={false}
                render={<Link href="/moduly" />}
                className="font-tosh"
                size="lg"
              >
                Otevřít katalog modulů
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/scenare" />}
                variant="outline"
                className="font-tosh"
                size="lg"
              >
                Tři průchozí scénáře
              </Button>
            </div>
          </div>

          <aside className="border border-black/10 bg-[#f2f2f3] p-5">
            <p className="font-tosh text-xs font-medium tracking-[0.14em] text-[#002870] uppercase">
              Jedno volání, jeden nález
            </p>
            <p className="font-tosh mt-3 text-2xl font-medium tracking-tight">
              Faktura servisu nese jiný VIN než smlouva.
            </p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="bg-white px-3 py-2">
                <dt className="text-[11px] tracking-wide text-[#666] uppercase">Faktura</dt>
                <dd className="font-mono">TMBJG7NE5L0123458</dd>
              </div>
              <div className="bg-white px-3 py-2">
                <dt className="text-[11px] tracking-wide text-[#666] uppercase">Smlouva a štítek</dt>
                <dd className="font-mono">TMBJG7NE5L0123456</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-[#444]">
              Agent nevrátí shrnutí případu. Vrátí nesoulad, obě hodnoty a
              částku, kterou podklady unesou. Likvidátorka to uvidí na případu
              ve Salesforce.
            </p>
            <Link
              href="/scenare/skoda-octavia-hav"
              className="font-tosh mt-5 inline-block text-sm font-medium text-[#ff5539] hover:text-black"
            >
              Spustit havarijní scénář ›
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#f2f2f3]">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <h2 className="font-tosh text-3xl font-medium tracking-tight">
            Stejná smyčka, jiný spis
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
            ClaimSense není jen pro pojišťovnu. Banka, dopravce, plátce péče,
            operátor i distributor řeší totéž: člověk má rozhodnutí udělat,
            a místo toho srovnává dokumenty.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <li key={industry.id} className="bg-white p-4">
                <h3 className="font-tosh text-lg font-medium">{industry.label}</h3>
                <p className="mt-1 text-sm text-[#444]">{industry.short}</p>
                <Link
                  href={`/moduly?odvetvi=${industry.id}`}
                  className="mt-3 inline-block text-sm text-[#002870] hover:text-[#ff5539]"
                >
                  Moduly ›
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-tosh text-3xl font-medium tracking-tight">
                Proces, ne jeden endpoint
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#444]">
                {modules.length} modulů. Každý má vlastního volajícího, vlastní
                dokumenty a vlastní tvar odpovědi. Likvidátor spouští krok, když
                na něj má podklady.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/moduly" />}
              variant="outline"
              className="font-tosh"
            >
              Celý katalog
            </Button>
          </div>
          <ol className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {processes.map((process, index) => {
              const count = modules.filter((item) => item.process === process.id).length
              return (
                <li key={process.id} className="border border-black/10 p-4">
                  <p className="font-mono text-xs text-[#ff5539]">0{index + 1}</p>
                  <h3 className="font-tosh mt-2 text-xl font-medium">{process.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#444]">{process.dek}</p>
                  <p className="mt-3 text-xs tracking-wide text-[#666] uppercase">
                    {count} {count === 1 ? "modul" : count < 5 ? "moduly" : "modulů"}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-[#002870] text-white">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <h2 className="font-tosh text-3xl font-medium tracking-tight">
            Tři spisy, které jdou projet
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
            Požadavek odejde z volajícího systému, agent označí nesoulady a
            odpověď se zapíše zpátky. Data jsou ukázková.
          </p>
          <ul className="mt-8 grid gap-3 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <li key={scenario.slug}>
                <Link
                  href={`/scenare/${scenario.slug}`}
                  className="flex h-full flex-col bg-white p-4 text-[#1a1a1a] hover:outline hover:outline-2 hover:outline-[#ff5539]"
                >
                  <p className="text-[11px] tracking-wide text-[#002870] uppercase">
                    {industries.find((item) => item.id === scenario.industry)?.label} ·{" "}
                    {scenario.caller.system}
                  </p>
                  <h3 className="font-tosh mt-2 text-xl font-medium tracking-tight">
                    {scenario.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#444]">{scenario.dek}</p>
                  <span className="font-tosh mt-4 text-sm text-[#ff5539]">Spustit ›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
