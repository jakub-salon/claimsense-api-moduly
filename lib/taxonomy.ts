export const industries = [
  {
    id: "insurance",
    label: "Pojišťovna",
    short: "Likvidace pojistné události",
  },
  {
    id: "bank",
    label: "Banka",
    short: "Akreditiv, zajištění, karty",
  },
  {
    id: "carrier",
    label: "Dopravce",
    short: "Přepravní škoda a CMR",
  },
  {
    id: "health",
    label: "Zdravotnictví",
    short: "Úhrada nároku plátci",
  },
  {
    id: "telecom",
    label: "Telekomunikace",
    short: "Kredit za porušení SLA",
  },
  {
    id: "energy",
    label: "Energetika",
    short: "Náhrada za přerušení dodávky",
  },
] as const

export const processes = [
  {
    id: "intake",
    label: "Příjem případu",
    dek: "Z nestrukturovaného hlášení vznikne případ, který umí uložit volající systém.",
  },
  {
    id: "coverage",
    label: "Posouzení krytí",
    dek: "Událost se srovná se smlouvou dřív, než se sbírají drahé podklady.",
  },
  {
    id: "entitlement",
    label: "Oprávnění a úplnost",
    dek: "Kdo smí dostat peníze a které dokumenty ještě chybí.",
  },
  {
    id: "crosscheck",
    label: "Křížová kontrola",
    dek: "Agent čte určené dokumenty a vrací nesoulady i podloženou částku.",
  },
  {
    id: "settlement",
    label: "Výpočet a rozhodnutí",
    dek: "Z podložené škody vznikne návrh plnění a návrh, jak případ uzavřít.",
  },
  {
    id: "oversight",
    label: "Revize spisu",
    dek: "Kontrola otevřených i uzavřených spisů proti podkladům, ne podle vzorku.",
  },
] as const

export type IndustryId = (typeof industries)[number]["id"]
export type ProcessId = (typeof processes)[number]["id"]

export function industryLabel(id: IndustryId) {
  return industries.find((item) => item.id === id)?.label ?? id
}

export function processById(id: ProcessId) {
  return processes.find((item) => item.id === id)!
}
