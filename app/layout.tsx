import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import localFont from "next/font/local"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-roboto",
  display: "swap",
})

const tosh = localFont({
  src: [
    { path: "../public/fonts/ToshA-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/ToshA-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/ToshA-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-tosh",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "ClaimSense API moduly",
    template: "%s · ClaimSense",
  },
  description:
    "API moduly ClaimSense pro křížovou kontrolu podkladů v likvidaci. Volá je systém likvidátora, výsledek se vrací zpátky do záznamu.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${roboto.variable} ${tosh.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-[#1a1a1a]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
