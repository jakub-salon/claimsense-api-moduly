import type { ApiModule } from "@/lib/types"

const envelope = (
  moduleName: string,
  traceId: string,
  outcome: string,
  action: string,
  result: Record<string, unknown>,
  discrepancies: Record<string, unknown>[] = [],
) => ({
  traceId,
  module: moduleName,
  outcome,
  recommendedAction: action,
  discrepancies,
  result,
})

export const modules: ApiModule[] = [
  {
    slug: "struktura-hlaseni",
    apiName: "claims.intake.structure",
    method: "POST",
    path: "/v1/claims/intake/structure",
    title: "Struktura hlášení",
    summary: "Z e-mailu a příloh udělá strukturovaný případ, který CRM umí uložit.",
    process: "intake",
    industries: ["insurance", "bank", "carrier", "energy"],
    caller:
      "Front office: e-mailová brána, webový formulář nebo dispečink. Výsledek přebírá CRM likvidace, ne likvidátor ručně.",
    documents: [
      { name: "E-mail nebo PDF hlášení", role: "Volný text události, kontakt, číslo smlouvy nebo zásilky." },
      { name: "Průvodní fotografie", role: "Kontrola, jestli popis škody odpovídá tomu, co je na snímku." },
    ],
    checks: [
      "Datum události není po datu hlášení a dává smysl vůči času přijetí.",
      "Identifikátor předmětu (RZ, VIN, číslo zásilky, EAN, číslo smlouvy) se opakuje v textu i v příloze.",
      "Kontaktní osoba a číslo smlouvy nebo zásilky patří k sobě.",
      "Povinná pole produktu, která z textu nešla přečíst, se vrátí jako chybějící — ne jako tichá nula.",
    ],
    resultFields: [
      { field: "result.structuredClaim", meaning: "Pole případu připravená k zápisu do volajícího systému." },
      { field: "result.missingFields", meaning: "Co musí doplnit člověk, než se spustí další modul." },
      { field: "result.fieldConfidence", meaning: "Jistota u polí, která vznikla čtením volného textu." },
    ],
    whySeparate:
      "Příjem volá jiný systém než likvidace škody a vrací strukturu případu, ne posudek. Dokud případ nemá pole, další API nemají na čem stát.",
    request: {
      caller: { system: "salesforce", actor: "intake.bot", recordId: null },
      channel: "email",
      productCode: "motor_hull",
      documents: [
        { id: "doc_email", type: "fnol_email", filename: "hlaseni-kralova.eml" },
        { id: "doc_photo", type: "damage_photo", filename: "predni-naraznik.jpg" },
      ],
    },
    response: envelope(
      "claims.intake.structure",
      "trc_intake_18442",
      "incomplete",
      "request_documents",
      {
        structuredClaim: {
          eventDate: "2026-03-12",
          reportedDate: "2026-03-13",
          location: "Barrandovský most, Praha",
          lossType: "collision",
          vehiclePlate: "5A2 1847",
          contactName: "Jana Králová",
        },
        missingFields: ["policeReportNumber", "vin"],
        fieldConfidence: { eventDate: 0.94, vehiclePlate: 0.99, vin: 0.22 },
      },
    ),
    relatedSlugs: ["shoda-s-krytim", "uplnost-spisu"],
  },
  {
    slug: "shoda-s-krytim",
    apiName: "claims.coverage.match",
    method: "POST",
    path: "/v1/claims/coverage/match",
    title: "Shoda s krytím",
    summary: "Srovná událost se smlouvou, výlukami, limitem a spoluúčastí.",
    process: "coverage",
    industries: ["insurance", "bank", "carrier"],
    caller:
      "Systém smluv nebo CRM. U banky jde o pojištění schopnosti splácet, u dopravce o pojištění odpovědnosti, u pojišťovny o pojistnou smlouvu.",
    documents: [
      { name: "Pojistná smlouva a dodatky", role: "Předmět, pojistná doba, limit, spoluúčast." },
      { name: "VPP / ZPP nebo wording", role: "Sjednané riziko a výluky." },
      { name: "Hlášení události", role: "Datum, příčina, předmět, který se má krýt." },
    ],
    checks: [
      "Datum události leží v pojistné době, včetně čekací doby.",
      "Předmět v hlášení je ten, který smlouva pojišťuje.",
      "Příčina je sjednané riziko a netrefuje výluku.",
      "Limit a spoluúčast se vrátí jako čísla pro pozdější výpočet, ne jako věta v odůvodnění.",
    ],
    resultFields: [
      { field: "result.coverageStatus", meaning: "covered, partial nebo excluded." },
      { field: "result.matchedPeril", meaning: "Které sjednané riziko sedí na příčinu." },
      { field: "result.exclusionsHit", meaning: "Výluky, které text smlouvy na případ vztahuje." },
      { field: "result.deductible", meaning: "Spoluúčast pro modul výpočtu plnění." },
    ],
    whySeparate:
      "Krytí je rozhodnutí nad smlouvou. Často ho drží jiný systém než faktury a fotky a likvidátor ho potřebuje dřív, než žádá o rozpočet.",
    request: {
      caller: { system: "salesforce", actor: "petra.mala", recordId: "HAV-2026-18442" },
      policyId: "HAV-448291",
      documents: [
        { id: "doc_policy", type: "policy_schedule", filename: "hav-448291.pdf" },
        { id: "doc_wording", type: "wording", filename: "vpp-hav-2025.pdf" },
        { id: "doc_fnol", type: "fnol", filename: "hlaseni.pdf" },
      ],
    },
    response: envelope(
      "claims.coverage.match",
      "trc_cov_18442",
      "consistent",
      "continue",
      {
        coverageStatus: "covered",
        matchedPeril: "collision",
        exclusionsHit: [],
        limit: { type: "actual_cash_value", currency: "CZK" },
        deductible: { amount: 5000, currency: "CZK" },
        policyPeriod: { from: "2025-01-01", to: "2026-12-31" },
      },
    ),
    relatedSlugs: ["struktura-hlaseni", "likvidace-vozidla", "vypocet-plneni"],
  },
  {
    slug: "uplnost-spisu",
    apiName: "claims.dossier.completeness",
    method: "POST",
    path: "/v1/claims/dossier/completeness",
    title: "Úplnost spisu",
    summary: "Řekne, které podklady chybí, než se spustí dražší kontrola.",
    process: "entitlement",
    industries: ["insurance", "bank", "carrier", "health", "telecom", "energy"],
    caller:
      "Case management ve volajícím systému. Modul je brána: bez povinných dokumentů se křížová kontrola nespouští.",
    documents: [
      { name: "Checklist produktu", role: "Co je povinné, co je volitelné, co blokuje výplatu." },
      { name: "Přijaté soubory", role: "Metadata a typ dokumentu, který už systém má." },
    ],
    checks: [
      "Každý povinný typ je buď přijatý, nebo vrací důvod, proč ještě nejde dál.",
      "Soubor patří ke správnému subjektu a datu události, ne k jinému případu.",
      "Nečitelný nebo prázdný sken se počítá jako chybějící.",
    ],
    resultFields: [
      { field: "result.complete", meaning: "Jestli smí navazující modul běžet." },
      { field: "result.blocking", meaning: "Dokumenty, bez kterých se výplata nebo platba nezahájí." },
      { field: "result.optional", meaning: "Co chybí, ale případ může pokračovat." },
    ],
    whySeparate:
      "Úplnost řídí urgenci vůči klientovi. Je to levné volání nad metadaty, ne čtení všech stran.",
    request: {
      caller: { system: "salesforce", actor: "petra.mala", recordId: "HAV-2026-18442" },
      productCode: "motor_hull",
      received: [
        { type: "fnol", documentId: "doc_fnol" },
        { type: "policy_schedule", documentId: "doc_policy" },
        { type: "damage_photo", documentId: "doc_photo" },
        { type: "repair_invoice", documentId: "doc_invoice" },
      ],
    },
    response: envelope(
      "claims.dossier.completeness",
      "trc_dos_18442",
      "incomplete",
      "request_documents",
      {
        complete: false,
        blocking: [{ type: "police_report", reason: "third_party_known_but_report_missing" }],
        optional: [{ type: "audatex_calculation", reason: "not_received" }],
      },
      [
        {
          code: "missing_police_report",
          severity: "high",
          message: "Known third party, police report not in the file.",
        },
      ],
    ),
    relatedSlugs: ["likvidace-vozidla", "opravnena-osoba"],
  },
  {
    slug: "opravnena-osoba",
    apiName: "claims.party.entitlement",
    method: "POST",
    path: "/v1/claims/party/entitlement",
    title: "Oprávněná osoba",
    summary: "Ověří, že peníze jdou oprávněné osobě a na její účet.",
    process: "entitlement",
    industries: ["insurance", "bank", "health"],
    caller:
      "CRM nebo core systém těsně před výplatou. Likvidátor ho volá, když se příjemce liší od pojištěného, dlužníka nebo pacienta.",
    documents: [
      { name: "Doklad totožnosti nebo výpis z rejstříku", role: "Jméno a identifikátor osoby." },
      { name: "Plná moc nebo dědické rozhodnutí", role: "Když nežádá pojištěný sám." },
      { name: "Smlouva", role: "Kdo je pojištěný, zástavce, oprávněná osoba." },
      { name: "Výpis účtu nebo potvrzení o účtu", role: "Majitel účtu se musí shodovat s příjemcem." },
    ],
    checks: [
      "Jméno a identifikátor na dokladu sedí na smlouvu.",
      "Role žadatele je pojištěný, poškozený, zmocněnec, nebo banka jako oprávněná.",
      "Majitel účtu je příjemce plnění. Neshoda jména se vrací jako nesoulad, ne jako varování v textu.",
    ],
    resultFields: [
      { field: "result.entitled", meaning: "Jestli smí systém připravit výplatu." },
      { field: "result.payee", meaning: "Komu a na jaký účet." },
      { field: "result.role", meaning: "insured, beneficiary, attorney, lender." },
    ],
    whySeparate:
      "Oprávnění je kontrola identity a účtu. Nemá se míchat s tím, jestli faktura sedí na fotky — padá to do jiné fronty.",
    request: {
      caller: { system: "salesforce", actor: "petra.mala", recordId: "HAV-2026-18442" },
      claimedPayee: { name: "Jan Král", account: "CZ6508000000001234567899" },
      documents: [
        { id: "doc_id", type: "national_id", filename: "op-kralova.pdf" },
        { id: "doc_policy", type: "policy_schedule", filename: "hav-448291.pdf" },
        { id: "doc_account", type: "account_proof", filename: "ucet.pdf" },
      ],
    },
    response: envelope(
      "claims.party.entitlement",
      "trc_pty_18442",
      "discrepant",
      "investigate",
      {
        entitled: false,
        role: "unknown",
        payee: { name: "Jan Král", account: "CZ6508000000001234567899" },
        insuredName: "Jana Králová",
      },
      [
        {
          code: "payee_name_mismatch",
          severity: "high",
          documents: ["national_id", "account_proof", "policy_schedule"],
          message: "Account holder Jan Král does not match insured Jana Králová. Power of attorney is missing.",
        },
      ],
    ),
    relatedSlugs: ["vypocet-plneni", "navrh-rozhodnuti"],
  },
  {
    slug: "likvidace-vozidla",
    apiName: "claims.motor.reconcile",
    method: "POST",
    path: "/v1/claims/motor/reconcile",
    title: "Likvidace škody na vozidle",
    summary: "Srovná smlouvu, protokol, fotky, fakturu a Audatex u škody na vozidle.",
    process: "crosscheck",
    industries: ["insurance"],
    caller:
      "Likvidátor havarijní škody ze Salesforce nebo z jádra likvidace. Systém pošle odkazy na dokumenty, které už ve spisu jsou.",
    documents: [
      { name: "Pojistná smlouva HAV", role: "VIN, RZ, spoluúčast, pojistná doba." },
      { name: "Hlášení škody", role: "Datum, místo, popis nárazu." },
      { name: "Záznam o dopravní nehodě", role: "Rozsah poškození a protistrana." },
      { name: "Fotodokumentace", role: "Co je vidět poškozené, VIN na štítku." },
      { name: "Faktura servisu", role: "Položky, hodiny, sazba, VIN na dokladu." },
      { name: "Kalkulace Audatex", role: "Srovnávací rozsah a sazba práce." },
    ],
    checks: [
      "VIN a RZ jsou stejné na smlouvě, protokolu, fotce štítku a faktuře.",
      "Datum nehody leží v pojistné době a faktura je až po něm.",
      "Položky faktury mají oporu ve fotkách a v záznamu policie.",
      "Hodiny a sazba práce se srovnají s Audatexem. Rozdíl se vyčíslí, ne smaže.",
    ],
    resultFields: [
      { field: "result.claimedAmount", meaning: "Co žádá servis." },
      { field: "result.supportedAmount", meaning: "Co podklady unesou." },
      { field: "result.unsupportedAmount", meaning: "Rozdíl k došetření." },
      { field: "discrepancies", meaning: "Konkrétní nesoulad, dokumenty a obě hodnoty." },
    ],
    whySeparate:
      "Havarijní škoda má vlastní sadu dokumentů a vlastní číselník nesouladů. Stejné API by u akreditivu nebo CMR lhala o tom, co agent čte.",
    request: {
      caller: { system: "salesforce", actor: "petra.mala", recordId: "HAV-2026-18442" },
      policy: { id: "HAV-448291", plate: "5A2 1847", vin: "TMBJG7NE5L0123456", deductible: { amount: 5000, currency: "CZK" } },
      documents: [
        { id: "doc_policy", type: "policy_schedule" },
        { id: "doc_fnol", type: "fnol" },
        { id: "doc_police", type: "police_report" },
        { id: "doc_photos", type: "damage_photo" },
        { id: "doc_invoice", type: "repair_invoice" },
        { id: "doc_audatex", type: "audatex" },
      ],
    },
    response: envelope(
      "claims.motor.reconcile",
      "trc_motor_18442",
      "discrepant",
      "investigate",
      {
        currency: "CZK",
        claimedAmount: 100450,
        supportedAmount: 68800,
        unsupportedAmount: 31650,
      },
      [
        {
          code: "vin_mismatch",
          severity: "high",
          message: "Invoice VIN TMBJG7NE5L0123458 does not match policy VIN TMBJG7NE5L0123456.",
        },
        {
          code: "part_not_on_photos",
          severity: "high",
          message: "Rear bumper paint 18400 CZK has no support in photos or the police report.",
        },
        {
          code: "labor_above_benchmark",
          severity: "medium",
          message: "Invoice labor is 14 h at 2400 CZK. Audatex supports 11 h at 1850 CZK.",
        },
      ],
    ),
    scenarioSlug: "skoda-octavia-hav",
    relatedSlugs: ["shoda-s-krytim", "uplnost-spisu", "vypocet-plneni", "navrh-rozhodnuti"],
  },
  {
    slug: "akreditiv",
    apiName: "trade.lc.examine",
    method: "POST",
    path: "/v1/trade/lc/examine",
    title: "Kontrola dokumentů k akreditivu",
    summary: "Porovná prezentaci dokumentů s podmínkami akreditivu.",
    process: "crosscheck",
    industries: ["bank"],
    caller:
      "Trade finance v core bankingu. Specialista neopisuje fakturu proti textu akreditivu — systém pošle prezentaci a čeká seznam diskrepancí.",
    documents: [
      { name: "Text akreditivu", role: "Částka, zboží, přístavy, latest shipment, pojištění." },
      { name: "Obchodní faktura", role: "Částka, měna, popis, počet kusů." },
      { name: "Náložní list", role: "On-board datum, přístav vykládky, kusy, hmotnost." },
      { name: "Packing list", role: "Kusy a hmotnost proti faktuře a B/L." },
      { name: "Certifikát původu", role: "Země a shoda beneficienta." },
      { name: "Pojistka přepravy", role: "110 % CIF, doložka, datum vystavení, trasa." },
    ],
    checks: [
      "Částka a měna faktury nepřekračují akreditiv.",
      "Datum nalodění není po latest shipment date.",
      "Přístav vykládky na B/L je přístav z akreditivu.",
      "Počet kusů a hmotnost sedí mezi akreditivem, fakturou, B/L a packing listem.",
      "Pojištění kryje požadovanou doložku, procento a destinaci a není vystavené až po nalodění.",
    ],
    resultFields: [
      { field: "result.presentationStatus", meaning: "complying nebo discrepant." },
      { field: "discrepancies", meaning: "Diskrepance s odkazem na dokument a podmínku akreditivu." },
      { field: "result.waiverAdvice", meaning: "Jestli banka má platbu zadržet a žádat waiver žadatele." },
    ],
    whySeparate:
      "Akreditiv není pojistná událost. Volá ho core banking, lhůty a názvosloví jsou z trade finance a výsledek je platit, nebo neplatit.",
    request: {
      caller: { system: "core_banking", actor: "trade.finance", recordId: "LC-CZ-2026-00418" },
      lc: {
        id: "LC-CZ-2026-00418",
        currency: "EUR",
        amount: 186000,
        incoterm: "CIF Hamburg",
        latestShipmentDate: "2026-02-28",
        goods: "cold-rolled steel coils",
        quantity: 40,
        insurance: { minPercentOfCif: 110, clauses: "ICC(A)" },
      },
      documents: [
        { id: "doc_lc", type: "letter_of_credit" },
        { id: "doc_invoice", type: "commercial_invoice" },
        { id: "doc_bl", type: "bill_of_lading" },
        { id: "doc_packing", type: "packing_list" },
        { id: "doc_origin", type: "certificate_of_origin" },
        { id: "doc_insurance", type: "cargo_insurance" },
      ],
    },
    response: envelope(
      "trade.lc.examine",
      "trc_lc_00418",
      "discrepant",
      "waive_required",
      { presentationStatus: "discrepant", currency: "EUR", lcAmount: 186000, invoiceAmount: 186400 },
      [
        { code: "overdrawn", severity: "high", message: "Invoice EUR 186400 exceeds LC EUR 186000." },
        { code: "late_shipment", severity: "high", message: "On board 2026-03-02 is after latest shipment 2026-02-28." },
        { code: "port_mismatch", severity: "high", message: "B/L discharges Rotterdam. LC requires Hamburg." },
        { code: "quantity_mismatch", severity: "high", message: "Invoice and packing list state 42 coils. LC and B/L state 40." },
        { code: "insurance_not_as_required", severity: "medium", message: "Certificate is ICC(B), dated after shipment, voyage ends in Rotterdam." },
      ],
    ),
    scenarioSlug: "akreditiv-ocel-linz",
    relatedSlugs: ["navrh-rozhodnuti", "revize-spisu"],
  },
  {
    slug: "prepravni-skoda-cmr",
    apiName: "cargo.cmr.reconcile",
    method: "POST",
    path: "/v1/cargo/cmr/reconcile",
    title: "Přepravní škoda podle CMR",
    summary: "Srovná CMR, dodací list, fotky, teplotu a fakturu u přepravní škody.",
    process: "crosscheck",
    industries: ["carrier"],
    caller:
      "Disponent škod v TMS dopravce. Do API jde zásilka, kterou TMS už zná, plus dokumenty od příjemce a komisaře.",
    documents: [
      { name: "Nákladní list CMR", role: "Kusy, hmotnost, plomba, odesílatel, příjemce, instrukce." },
      { name: "Dodací list s výhradou", role: "Kdy a jak příjemce škodu vytkl." },
      { name: "Fotodokumentace", role: "Poškození a číslo plomby na snímku." },
      { name: "Obchodní faktura", role: "Hodnota zásilky a počet kusů." },
      { name: "Teplotní záznam", role: "Průběh teploty proti instrukci na CMR." },
      { name: "Zpráva havarijního komisaře", role: "Příčina: manipulace, teplota, nebo obojí odděleně." },
    ],
    checks: [
      "Výhrada na dodacím listu stihla lhůtu pro zjevnou škodu.",
      "Kusy a hmotnost sedí mezi CMR, fakturou a dodacím listem.",
      "Číslo plomby na CMR sedí na fotografii.",
      "Teplotní exkurze se nelepí automaticky na mechanické poškození, pokud to komisař odděluje.",
      "Nárokovaná hodnota se krátí na podložené kusy a srovná s limitem CMR.",
    ],
    resultFields: [
      { field: "result.claimedAmount", meaning: "Částka, kterou odesílatel žádá." },
      { field: "result.supportedAmount", meaning: "Částka podložená kusy a zprávou komisaře." },
      { field: "result.cmrLimit", meaning: "Limit 8,33 SDR/kg přepočtený kurzem z požadavku." },
      { field: "result.liabilityStance", meaning: "partial, deny nebo limit_applies." },
    ],
    whySeparate:
      "TMS neposílá pojistnou smlouvu HAV. Posílá CMR a teplotu. Limit odpovědnosti dopravce je jiný vzorec než pojistné plnění.",
    request: {
      caller: { system: "tms", actor: "tomas.vesely", recordId: "CMR-2026-7731" },
      sdrToEur: 1.173,
      cmrLimitRule: "8.33 SDR per kg",
      documents: [
        { id: "doc_cmr", type: "cmr" },
        { id: "doc_pod", type: "proof_of_delivery" },
        { id: "doc_photos", type: "damage_photo" },
        { id: "doc_invoice", type: "commercial_invoice" },
        { id: "doc_temp", type: "temperature_log" },
        { id: "doc_survey", type: "survey_report" },
      ],
    },
    response: envelope(
      "cargo.cmr.reconcile",
      "trc_cmr_7731",
      "discrepant",
      "partial_approve",
      {
        currency: "EUR",
        claimedAmount: 92400,
        supportedAmount: 15400,
        cmrLimit: { amount: 47487.5, currency: "EUR", basis: "8.33 SDR/kg * 4860 kg * 1.173" },
        liabilityStance: "partial",
      },
      [
        { code: "seal_mismatch", severity: "high", message: "CMR seal 448291, photo shows 448219." },
        { code: "temperature_excursion", severity: "medium", message: "Log exceeded +8 C. Instruction was +2 C to +8 C. Surveyor does not attribute the crushed pallets to temperature." },
        { code: "claimed_above_supported", severity: "high", message: "Claim is EUR 92400 for 12 pallets. Survey supports 2 pallets, EUR 15400." },
      ],
    ),
    scenarioSlug: "cmr-pharmanord",
    relatedSlugs: ["uplnost-spisu", "navrh-rozhodnuti"],
  },
  {
    slug: "zajisteni-uveru",
    apiName: "lending.collateral.reconcile",
    method: "POST",
    path: "/v1/lending/collateral/reconcile",
    title: "Soulad podkladů k zajištění",
    summary: "Zkontroluje úvěr, zástavu, list vlastnictví, odhad a pojistku.",
    process: "crosscheck",
    industries: ["bank"],
    caller:
      "Workout nebo správa zajištění v core bankingu, když se má čerpat, přecenit nebo realizovat zástava.",
    documents: [
      { name: "Úvěrová smlouva", role: "Dlužník, výše, účel, požadované zajištění." },
      { name: "Zástavní smlouva", role: "Zástavce a identifikace nemovitosti." },
      { name: "List vlastnictví", role: "Vlastník, LV, omezení." },
      { name: "Odhad", role: "Hodnota a datum, vůči kterému se počítá LTV." },
      { name: "Pojistka nemovitosti", role: "Částka a vinkulace ve prospěch banky." },
    ],
    checks: [
      "Zástavce na smlouvě je vlastník na listu vlastnictví.",
      "Číslo LV a parcela sedí mezi zástavní smlouvou a LV.",
      "Odhad není starší, než dovoluje pravidlo v požadavku, a hodnota kryje zůstatek podle LTV.",
      "Pojistná částka neklesá pod odhad a vinkulace zní na banku.",
    ],
    resultFields: [
      { field: "result.enforceable", meaning: "Jestli podklady drží pohromadě pro čerpání nebo realizaci." },
      { field: "result.ltv", meaning: "Zůstatek vůči odhadu." },
      { field: "discrepancies", meaning: "Kde se smlouvy rozcházejí." },
    ],
    whySeparate:
      "Realizace zajištění není likvidace škody. Volá ji úvěrový core a výsledek blokuje čerpání, ne pojistné plnění.",
    request: {
      caller: { system: "core_banking", actor: "workout.desk", recordId: "LN-2024-11880" },
      rules: { maxValuationAgeMonths: 12, maxLtv: 0.8 },
      loanBalance: { amount: 6100000, currency: "CZK" },
      documents: [
        { id: "doc_loan", type: "loan_agreement" },
        { id: "doc_pledge", type: "pledge_agreement" },
        { id: "doc_title", type: "land_register" },
        { id: "doc_val", type: "valuation" },
        { id: "doc_ins", type: "property_insurance" },
      ],
    },
    response: envelope(
      "lending.collateral.reconcile",
      "trc_col_11880",
      "discrepant",
      "investigate",
      { enforceable: false, ltv: 1.45, valuation: { amount: 4200000, currency: "CZK", date: "2024-11-02" } },
      [
        { code: "owner_mismatch", severity: "high", message: "Pledge names Eva Soukupová. Land register owner is Soukup s.r.o." },
        { code: "ltv_breach", severity: "high", message: "Balance 6100000 CZK against valuation 4200000 CZK is above max LTV 0.80." },
        { code: "insurance_not_assigned", severity: "medium", message: "Policy has no assignment in favour of the bank." },
      ],
    ),
    relatedSlugs: ["opravnena-osoba", "revize-spisu"],
  },
  {
    slug: "karetni-reklamace",
    apiName: "cards.dispute.reconcile",
    method: "POST",
    path: "/v1/cards/dispute/reconcile",
    title: "Karetní reklamace",
    summary: "Srovná reklamaci držitele s autorizací, dokladem obchodníka a doručením.",
    process: "crosscheck",
    industries: ["bank"],
    caller:
      "Systém karetních sporů. Operátor spustí kontrolu, jakmile dorazí podklady obchodníka, a výsledek zapíše k chargebacku.",
    documents: [
      { name: "Reklamace držitele", role: "Částka, datum, co držitel popírá." },
      { name: "Autorizace", role: "Částka, 3-D Secure, čas transakce." },
      { name: "Doklad obchodníka", role: "Položky a částka účtenky." },
      { name: "Potvrzení doručení", role: "Jestli zboží odešlo a kam." },
    ],
    checks: [
      "Částka reklamace, autorizace a účtenky je jedna transakce, ne sousední zaúčtování.",
      "Duplicitní clearing se označí, když sedí částka, obchodník a čas.",
      "Doručení se srovná s adresou, kterou držitel uvedl.",
      "3-D Secure se vrátí jako fakt, který mění postoj k odpovědnosti, ne jako skrytá poznámka.",
    ],
    resultFields: [
      { field: "result.disputeStance", meaning: "represent, accept_chargeback nebo need_documents." },
      { field: "result.authenticated", meaning: "Jestli autorizace prošla 3-D Secure." },
      { field: "discrepancies", meaning: "Nesoulad částky, duplicita, nebo doručení." },
    ],
    whySeparate:
      "Karetní spor má vlastní lhůty schémat a vlastní výsledek: chargeback, nebo representment. Nepatří do API pojistného plnění.",
    request: {
      caller: { system: "card_disputes", actor: "disputes.queue", recordId: "DSP-2026-5521" },
      transaction: { amount: 4890, currency: "CZK", merchant: "Elektro Dům", authorizedAt: "2026-02-02T19:14:00+01:00" },
      documents: [
        { id: "doc_claim", type: "cardholder_dispute" },
        { id: "doc_auth", type: "authorization" },
        { id: "doc_receipt", type: "merchant_receipt" },
        { id: "doc_pod", type: "delivery_proof" },
      ],
    },
    response: envelope(
      "cards.dispute.reconcile",
      "trc_dsp_5521",
      "discrepant",
      "represent",
      { disputeStance: "represent", authenticated: true, duplicateClearing: false },
      [
        {
          code: "delivery_matches_cardholder",
          severity: "medium",
          message: "Delivery photo and address match the cardholder. Dispute says goods not received. Authorization was 3-D Secure.",
        },
      ],
    ),
    relatedSlugs: ["navrh-rozhodnuti"],
  },
  {
    slug: "zdravotni-narok",
    apiName: "health.reimbursement.reconcile",
    method: "POST",
    path: "/v1/health/reimbursement/reconcile",
    title: "Úhrada zdravotního nároku",
    summary: "Srovná žádanku, fakturu poskytovatele a sazebník úhrady.",
    process: "crosscheck",
    industries: ["health"],
    caller:
      "Likvidátor úhrad ve zdravotní pojišťovně nebo v asistenční službě. Volá API ze svého claims systému, ne z pojišťovny vozidel.",
    documents: [
      { name: "Žádanka nebo recept", role: "Pacient, kód výkonu, datum, indikace." },
      { name: "Faktura poskytovatele", role: "Vykázaný kód a částka." },
      { name: "Průkaz pojištěnce", role: "Že pacient na žádance je pojištěnec na faktuře." },
      { name: "Sazebník plátce", role: "Maximální úhrada kódu." },
    ],
    checks: [
      "Pacient na žádance, průkazu a faktuře je jeden člověk.",
      "Kód na faktuře je kód ze žádanky.",
      "Částka nepřekračuje sazebník pro daný kód a datum.",
      "Datum výkonu leží v platnosti žádanky.",
    ],
    resultFields: [
      { field: "result.payableAmount", meaning: "Částka podle sazebníku." },
      { field: "result.billedAmount", meaning: "Částka na faktuře." },
      { field: "result.codeMatch", meaning: "Jestli kód výkonu sedí." },
    ],
    whySeparate:
      "Úhrada zdravotního nároku srovnává kódy výkonů a sazebník. Stejný agent, jiný slovník dokumentů než VIN a nárazník.",
    request: {
      caller: { system: "payer_claims", actor: "uhrady.desk", recordId: "ZH-2026-33091" },
      documents: [
        { id: "doc_referral", type: "referral" },
        { id: "doc_invoice", type: "provider_invoice" },
        { id: "doc_card", type: "insurance_card" },
        { id: "doc_tariff", type: "tariff" },
      ],
    },
    response: envelope(
      "health.reimbursement.reconcile",
      "trc_zh_33091",
      "discrepant",
      "partial_approve",
      { currency: "CZK", billedAmount: 1450, payableAmount: 890, billedCode: "18520", referredCode: "18521" },
      [
        { code: "procedure_code_mismatch", severity: "high", message: "Invoice bills 18520. Referral authorises 18521." },
        { code: "above_tariff", severity: "medium", message: "Billed 1450 CZK. Tariff for the referred code on this date is 890 CZK." },
      ],
    ),
    relatedSlugs: ["uplnost-spisu", "opravnena-osoba", "navrh-rozhodnuti"],
  },
  {
    slug: "sla-kredit",
    apiName: "telecom.sla.credit",
    method: "POST",
    path: "/v1/telecom/sla/credit",
    title: "Kredit za porušení SLA",
    summary: "Spočítá kredit z ticketu, monitoringu a smlouvy SLA.",
    process: "settlement",
    industries: ["telecom"],
    caller:
      "BSS/OSS operátora. Pracovník péče o firemního zákazníka spustí výpočet z trouble ticketu a kredit se vrací na fakturu.",
    documents: [
      { name: "Trouble ticket", role: "Čas výpadku, jak ho zapsala obsluha." },
      { name: "Záznam monitoringu", role: "Čas výpadku z dohledu sítě." },
      { name: "Smlouva SLA", role: "Práh, od kterého vzniká kredit, a vzorec." },
      { name: "Faktura", role: "Jestli už na ní kredit za stejný výpadek je." },
    ],
    checks: [
      "Délka výpadku na ticketu se srovná s monitoringem. Pro výpočet se vezme doložený interval.",
      "Práh SLA se aplikuje na doložený interval, ne na číslo ze stížnosti.",
      "Už vystavený kredit za stejné okno se odečte, aby se neplatil dvakrát.",
    ],
    resultFields: [
      { field: "result.creditedOutage", meaning: "Interval, který podklady unesou." },
      { field: "result.grossCredit", meaning: "Kredit podle vzorce SLA." },
      { field: "result.alreadyCredited", meaning: "Co už faktura obsahuje." },
      { field: "result.netCredit", meaning: "Co se má nově zapsat." },
    ],
    whySeparate:
      "Výsledek není zamítnutí škody, ale částka kreditu na fakturu. Počítá se z jiných dokumentů a vrací se do billingu.",
    request: {
      caller: { system: "bss", actor: "care.enterprise", recordId: "TT-2026-90812" },
      documents: [
        { id: "doc_ticket", type: "trouble_ticket" },
        { id: "doc_monitor", type: "network_monitoring" },
        { id: "doc_sla", type: "sla_contract" },
        { id: "doc_invoice", type: "invoice" },
      ],
    },
    response: envelope(
      "telecom.sla.credit",
      "trc_sla_90812",
      "discrepant",
      "partial_approve",
      {
        currency: "CZK",
        ticketOutage: "PT6H20M",
        monitoredOutage: "PT4H5M",
        grossCredit: 840,
        alreadyCredited: 200,
        netCredit: 640,
      },
      [
        {
          code: "ticket_longer_than_monitoring",
          severity: "medium",
          message: "Ticket states 6 h 20 min. Monitoring supports 4 h 05 min. Credit uses the monitored interval.",
        },
      ],
    ),
    relatedSlugs: ["navrh-rozhodnuti"],
  },
  {
    slug: "nahrada-vypadek",
    apiName: "energy.outage.reconcile",
    method: "POST",
    path: "/v1/energy/outage/reconcile",
    title: "Náhrada za přerušení dodávky",
    summary: "Srovná hlášení zákazníka s provozním deníkem a měřením.",
    process: "crosscheck",
    industries: ["energy"],
    caller:
      "Zákaznický systém distributora. Operátor po přijetí hlášení pošle EAN, deník a prahovou hodnotu ze standardu, který má ve smlouvě nebo v číselníku.",
    documents: [
      { name: "Hlášení zákazníka", role: "EAN a interval, který zákazník tvrdí." },
      { name: "Provozní deník", role: "Začátek a konec přerušení na vedení." },
      { name: "Data měření", role: "Mezera v profilu odběru." },
      { name: "Standard náhrady", role: "Práh hodin, od kterého náhrada vzniká. Posílá ho volající, agent ho nevymýšlí." },
    ],
    checks: [
      "EAN v hlášení patří k odběrnému místu v deníku.",
      "Interval z hlášení, deníku a měření se překryje. Pro náhradu platí doložený průnik.",
      "Náhrada se přizná jen když doložený interval překročí práh z požadavku.",
      "Stejné okno se nehradí podruhé.",
    ],
    resultFields: [
      { field: "result.supportedOutage", meaning: "Interval, na kterém se shodne deník a měření." },
      { field: "result.thresholdMet", meaning: "Jestli interval překročil práh." },
      { field: "result.compensation", meaning: "Částka podle pravidla v požadavku, nebo nula." },
    ],
    whySeparate:
      "Distributor nemá pojistný spis. Má deník a měření. Práh náhrady musí přijít v požadavku, protože ho určuje standard plátce, ne model.",
    request: {
      caller: { system: "cis", actor: "sit.vyrazky", recordId: "OUT-2026-4410" },
      compensationRule: { threshold: "PT12H", amount: 3000, currency: "CZK" },
      documents: [
        { id: "doc_claim", type: "customer_report" },
        { id: "doc_log", type: "operations_log" },
        { id: "doc_meter", type: "meter_interval" },
      ],
    },
    response: envelope(
      "energy.outage.reconcile",
      "trc_out_4410",
      "discrepant",
      "deny",
      {
        claimedOutage: "PT11H",
        supportedOutage: "PT3H40M",
        threshold: "PT12H",
        thresholdMet: false,
        compensation: { amount: 0, currency: "CZK" },
      },
      [
        {
          code: "claimed_longer_than_meter",
          severity: "high",
          message: "Customer reports 11 h. Operations log and meter agree on 3 h 40 min, under the 12 h threshold.",
        },
      ],
    ),
    relatedSlugs: ["struktura-hlaseni", "navrh-rozhodnuti"],
  },
  {
    slug: "vypocet-plneni",
    apiName: "claims.payout.calculate",
    method: "POST",
    path: "/v1/claims/payout/calculate",
    title: "Výpočet pojistného plnění",
    summary: "Dopočítá plnění ze spoluúčasti, limitu, DPH a záloh.",
    process: "settlement",
    industries: ["insurance"],
    caller:
      "Jádro likvidace, až když modul křížové kontroly vrátil podloženou škodu. Bez ní se výpočet nespouští.",
    documents: [
      { name: "Smlouva", role: "Spoluúčast, limit, režim DPH." },
      { name: "Podložená škoda", role: "Částka z předchozího modulu, ne z faktury naslepo." },
      { name: "Předchozí výplaty", role: "Zálohy a částečná plnění k témuž případu." },
    ],
    checks: [
      "Základem je supportedAmount, ne claimedAmount.",
      "Spoluúčast a limit se aplikují v pořadí, které přijde v pravidle produktu.",
      "Plátci DPH se DPH do plnění nezapočte, neplátci ano — podle příznaku na smlouvě.",
      "Zálohy se odečtou, aby se nevyplatily dvakrát.",
    ],
    resultFields: [
      { field: "result.breakdown", meaning: "Kroky: základ, DPH, spoluúčast, limit, zálohy, k výplatě." },
      { field: "result.payable", meaning: "Částka, kterou smí výplatní systém vzít jako návrh." },
    ],
    whySeparate:
      "Výpočet je deterministický vzorec nad už srovnanými čísly. Křížová kontrola dokumentů do něj nepatří a naopak — likvidátor je volá odděleně a vidí oba výsledky.",
    request: {
      caller: { system: "claims_core", actor: "petra.mala", recordId: "HAV-2026-18442" },
      supportedAmount: { amount: 68800, currency: "CZK" },
      insuredIsVatPayer: false,
      deductible: { amount: 5000, currency: "CZK" },
      priorPayments: [],
      documents: [{ id: "doc_policy", type: "policy_schedule" }],
    },
    response: envelope(
      "claims.payout.calculate",
      "trc_pay_18442",
      "consistent",
      "approve",
      {
        currency: "CZK",
        breakdown: [
          { step: "supported_loss", amount: 68800 },
          { step: "vat_kept_non_payer", amount: 0 },
          { step: "deductible", amount: -5000 },
          { step: "prior_payments", amount: 0 },
        ],
        payable: 63800,
      },
    ),
    relatedSlugs: ["likvidace-vozidla", "navrh-rozhodnuti"],
  },
  {
    slug: "navrh-rozhodnuti",
    apiName: "claims.decision.draft",
    method: "POST",
    path: "/v1/claims/decision/draft",
    title: "Návrh rozhodnutí",
    summary: "Vrátí návrh uznat, krátit, zamítnout nebo došetřit — s citacemi.",
    process: "settlement",
    industries: ["insurance", "bank", "carrier", "health", "telecom", "energy"],
    caller:
      "Workflow ve volajícím systému, když už doběhly kontroly, které produkt vyžaduje. Návrh čeká na likvidátora. Sám o sobě peníze neposílá.",
    documents: [
      { name: "Výstupy předchozích modulů", role: "Strukturované nesoulady a částky, ne surový spis znovu." },
      { name: "Klíčové dokumenty", role: "Jen ty, na které se má návrh odvolat citací." },
    ],
    checks: [
      "Návrh nesmí uznat položku, kterou předchozí modul označil jako nepodloženou.",
      "Každé tvrzení v odůvodnění má citaci dokumentu a pole.",
      "Když chybí povinný modul, návrh je došetřit, ne zamítnout.",
    ],
    resultFields: [
      { field: "result.proposedOutcome", meaning: "approve, partial_approve, deny nebo investigate." },
      { field: "result.reasoning", meaning: "Krátké odůvodnění pro likvidátora." },
      { field: "result.citations", meaning: "Dokument, pole, hodnota." },
      { field: "result.handlerActions", meaning: "Co má člověk potvrdit, než se píše klientovi." },
    ],
    whySeparate:
      "Rozhodnutí je jiný kontrakt než kontrola. Vrací se do fronty likvidátora a bez jeho potvrzení volající systém výplatu nespustí.",
    request: {
      caller: { system: "salesforce", actor: "petra.mala", recordId: "HAV-2026-18442" },
      priorModules: ["claims.coverage.match", "claims.motor.reconcile", "claims.payout.calculate"],
      documents: [
        { id: "doc_invoice", type: "repair_invoice" },
        { id: "doc_photos", type: "damage_photo" },
      ],
    },
    response: envelope(
      "claims.decision.draft",
      "trc_dec_18442",
      "discrepant",
      "investigate",
      {
        proposedOutcome: "investigate",
        reasoning: "Front damage is supported. Rear bumper paint and the invoice VIN are not. Do not pay the invoice in full.",
        citations: [
          { documentId: "doc_photos", field: "damageArea", value: "front" },
          { documentId: "doc_invoice", field: "vin", value: "TMBJG7NE5L0123458" },
        ],
        handlerActions: ["confirm_vin_with_workshop", "drop_or_evidence_rear_bumper"],
      },
    ),
    relatedSlugs: ["likvidace-vozidla", "vypocet-plneni", "revize-spisu"],
  },
  {
    slug: "revize-spisu",
    apiName: "claims.file.review",
    method: "POST",
    path: "/v1/claims/file/review",
    title: "Revize spisu",
    summary: "Zkontroluje, jestli rozhodnutí sedí na podkladech. U otevřených i uzavřených spisů.",
    process: "oversight",
    industries: ["insurance", "bank", "carrier"],
    caller:
      "Kontrola kvality nebo compliance, dávkově. Ne likvidátor v prvním kole. ClaimSense tím nahrazuje namátkovou revizi spisu.",
    documents: [
      { name: "Záznam rozhodnutí", role: "Co se vyplatilo nebo zamítlo a proč." },
      { name: "Podklady, na které se rozhodnutí odvolává", role: "Jestli citace v rozhodnutí opravdu v dokumentu je." },
      { name: "Lhůty procesu", role: "Jestli revize, výhrada nebo prezentace doběhly včas." },
    ],
    checks: [
      "Vyplacená částka nepřesahuje to, co podklady doložily.",
      "Odůvodnění cituje dokument, který ve spisu je.",
      "Uzavřený spis bez citace u sporné položky je nález, ne kosmetická poznámka.",
    ],
    resultFields: [
      { field: "result.reviewStatus", meaning: "pass nebo finding." },
      { field: "result.findings", meaning: "Co v rozhodnutí nemá oporu." },
      { field: "result.fileState", meaning: "open nebo closed — revize běží nad obojím." },
    ],
    whySeparate:
      "Revize se volá po rozhodnutí a často nad uzavřeným spisem. Je to dohled, ne další krok výplaty, a má jiného volajícího.",
    request: {
      caller: { system: "qa_batch", actor: "cfr.job", recordId: "HAV-2026-17990" },
      fileState: "closed",
      decision: { outcome: "approve", paidAmount: 100450, currency: "CZK" },
      documents: [
        { id: "doc_decision", type: "decision_record" },
        { id: "doc_invoice", type: "repair_invoice" },
        { id: "doc_photos", type: "damage_photo" },
      ],
    },
    response: envelope(
      "claims.file.review",
      "trc_cfr_17990",
      "discrepant",
      "investigate",
      { reviewStatus: "finding", fileState: "closed" },
      [
        {
          code: "paid_above_evidence",
          severity: "high",
          message: "Closed file paid the full invoice, including rear bumper paint, with no citation to a photo or police report.",
        },
      ],
    ),
    relatedSlugs: ["navrh-rozhodnuti", "likvidace-vozidla"],
  },
]

export function getModule(slug: string) {
  return modules.find((item) => item.slug === slug)
}

export function modulesForProcess(processId: ApiModule["process"]) {
  return modules.filter((item) => item.process === processId)
}
