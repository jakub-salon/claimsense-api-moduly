"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/moduly", label: "Moduly" },
  { href: "/scenare", label: "Scénáře" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f2f2f3]">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/bull-logo.svg"
            alt="Bull"
            width={97}
            height={36}
            priority
            className="h-9 w-auto shrink-0"
          />
          <span className="hidden h-8 w-px bg-black/15 sm:block" />
          <span className="hidden min-w-0 sm:block">
            <span className="font-tosh block text-[15px] leading-none font-medium tracking-tight text-black">
              ClaimSense
            </span>
            <span className="mt-1 block text-[11px] tracking-wide text-[#666]">
              API moduly likvidace
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-tosh rounded-sm px-3 py-2 text-sm font-medium text-black hover:text-[#ff5539]"
            >
              {link.label}
            </Link>
          ))}
          <Button
            nativeButton={false}
            render={<Link href="/scenare/skoda-octavia-hav" />}
            className="font-tosh ml-2 px-4"
          >
            Spustit scénář
          </Button>
        </nav>

        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-expanded={open}
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-black/5 bg-[#f2f2f3] px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-tosh rounded-sm px-2 py-3 text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              nativeButton={false}
              render={<Link href="/scenare/skoda-octavia-hav" />}
              className="font-tosh mt-2"
              onClick={() => setOpen(false)}
            >
              Spustit scénář
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
