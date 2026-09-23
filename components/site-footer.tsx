import Image from "next/image"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Image
            src="/brand/bull-logo.svg"
            alt="Bull"
            width={86}
            height={32}
            className="h-8 w-auto"
          />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#666]">
            ClaimSense je produkt Bull. Tohle demo rozpadá likvidaci na API, která
            volá systém likvidátora. Spisy jsou smyšlené, žádné ostré napojení.
          </p>
        </div>
        <div className="flex gap-5 text-sm">
          <Link href="/moduly" className="hover:text-[#ff5539]">
            Moduly
          </Link>
          <Link href="/scenare" className="hover:text-[#ff5539]">
            Scénáře
          </Link>
        </div>
      </div>
    </footer>
  )
}
