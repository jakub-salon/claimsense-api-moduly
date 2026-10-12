export function defaultCheckPrompt(check: string, documents: string[]) {
  return [
    `Kontrola: ${check}`,
    `Pracuj jen s dokumenty: ${documents.join(", ")}.`,
    "U každé hodnoty uveď, ze kterého dokumentu a pole pochází.",
    "Když se hodnoty liší, vrať nesoulad s oběma hodnotami. Když údaj chybí, nic nedopočítávej a kontrolu označ jako nerozhodnutou.",
  ].join("\n")
}
