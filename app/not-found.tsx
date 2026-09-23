import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20">
      <p className="font-tosh text-xs font-medium tracking-[0.16em] text-[#002870] uppercase">
        404
      </p>
      <h1 className="font-tosh mt-3 text-4xl font-black tracking-tight">
        Tahle stránka v demu není
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#444]">
        Katalog modulů a tři scénáře jsou v menu. Adresa, na kterou jste
        přišli, k žádnému z nich nepatří.
      </p>
      <Button
        nativeButton={false}
        render={<Link href="/moduly" />}
        className="font-tosh mt-6"
      >
        Zpět do katalogu
      </Button>
    </div>
  )
}
