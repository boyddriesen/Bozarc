# Bozarc — Analyse website &amp; marketingkanalen

Strategisch voorstel ter voorbereiding van de samenwerking met Bozarc (carports, terrasoverkappingen, Nova, Vista, serres/tuinkamers en B2B-overkappingen). Dit document geeft een doelbewust beknopte analyse van de huidige website en marketinginspanningen, gepositioneerd tegenover de markt, met concrete aanbevelingen.

**Doel:** aantonen dat we het merk, de doelgroep en de markt waarin Bozarc speelt goed begrijpen — als basis voor een verdere samenwerking. Geen cijfers of prijsvoorstel op dit moment, puur strategische aanbevelingen.

## Inhoud

1. [Website-analyse](docs/01-website-analyse.md) — huidige staat van bozarc.be
2. [Marketingkanalen](docs/02-marketingkanalen.md) — Google/Meta/Bing, service fee, social media, meetbaarheid
3. [Keyword research](docs/03-keyword-research.md) — besprekingsdocument met clusters, negatives en testplan voor Google Ads/SEO
4. [Concurrentie-benchmark](docs/04-concurrentie-benchmark.md) — Bozarc tegenover MiniFlat, Veranco, Winsol, Harol, Ovalux
5. [Doelgroep en seizoenspatroon](docs/05-doelgroep-seizoenspatroon.md) — B2C en B2B
6. [Aanbevelingen](docs/06-aanbevelingen.md) — gefaseerde aanpak, startend bij een merk-/strategieworkshop
7. [Cloudflare Workers publicatie](docs/07-cloudflare-pages.md) — automatische microsite vanuit GitHub
8. [Productbreed auditkader](docs/08-productbreed-auditkader.md) — scope-guard voor alle huidige producten en SEO/SEA/GEO/AEO
9. [Productbrede concurrentieaudit](docs/09-productbrede-concurrentieaudit.md) — concurrentiedruk en productstructuur per BOzARC-productfamilie
10. [Google-zichtbaarheid en SEO/SEA/GEO/AEO audit](docs/10-google-zichtbaarheid-seo-sea-geo-aeo-audit.md) — indicatieve publieke SERP-steekproef en actiepunten per producttak
11. [Golden Circle-vragenlijst](docs/11-golden-circle-vragenlijst.md) — vragen voor Bozarc zelf, als voorbereiding op de merk-/strategieworkshop
12. [Resultaten Google Ads](docs/12-google-ads-resultaten.md) — accountcijfers, regio- en campagnedetail, zoekwoorden en bevindingen op basis van de Google Ads-exports

## Reports

Bijkomend onderzoeks- en deliverable-materiaal staat in [`reports/`](reports/):

- [`Bozarc_Analyse_Website_Marketing.pdf`](reports/Bozarc_Analyse_Website_Marketing.pdf) — het volledige rapport als pdf (gegenereerd via [`generate_pdf.py`](reports/generate_pdf.py)). Bevat een aantal gelabelde plaatshouders voor schermafbeeldingen die nog manueel toegevoegd moeten worden.
- [`bozarc_keyword_research.xlsx`](reports/bozarc_keyword_research.xlsx) — de volledige keyword-werkmap (clusters, autosuggest-rondes, negatives, sources) waarop onderdeel 3 is gebaseerd.
- [`bozarc_productboom_mapping.xlsx`](reports/bozarc_productboom_mapping.xlsx) — productboom van de huidige Bozarc-site met hoofdgroep, subpagina, URL, korte samenvatting, verwarringspunt en mogelijke klantvraag.
- [`bozarc_productbrede_audit_concurrentie_en_google.xlsx`](reports/bozarc_productbrede_audit_concurrentie_en_google.xlsx) — gecombineerde auditwerkmap met concurrentieaudit, SERP-steekproef, SEO/SEA/GEO/AEO-matrix, productpagina-check en bronnen.

## Cloudflare Workers

Deze repo bevat een kleine statische researchsite die de markdown-documenten en downloads publiceert via Cloudflare Workers static assets.

```bash
npm run build
```

Gebruik in Cloudflare Workers:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Production branch: `main`

De site staat achter een wachtwoord (Cloudflare-secret `SITE_PASSWORD`) — zie [Cloudflare Workers publicatie](docs/07-cloudflare-pages.md).
