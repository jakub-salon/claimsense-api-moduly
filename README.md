# ClaimSense API moduly

Klikací demo API, kterými systém likvidátora (Salesforce, core banking, TMS) volá agenta ClaimSense. Agent srovná fakta napříč dokumenty a výsledek vrátí do stejného záznamu.

Demo je mock. Žádné ostré API, žádné reálné spisy. Názvy polí v JSON jsou anglicky, obrazovky česky.

## Spuštění

```bash
npm install
npm run dev
```

Vývojový server poslouchá na `0.0.0.0:43123`.

- Katalog modulů: `/moduly`
- Průchozí scénáře: `/scenare`

## Co v demu je

Moduly jsou seskupené podle kroku likvidace (příjem, krytí, oprávnění, křížová kontrola, výpočet, revize) a jdou filtrovat podle odvětví: pojišťovna, banka, dopravce, zdravotnictví, telekomunikace, energetika.

Tři scénáře jdou projet od požadavku po zápis zpátky:

- havarijní škoda na vozidle
- kontrola dokumentů k akreditivu
- přepravní škoda podle CMR
