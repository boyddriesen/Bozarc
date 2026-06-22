# 7. Cloudflare Workers publicatie

Deze repo is voorbereid om als kleine research-microsite via Cloudflare Workers static assets te draaien.

## Bron en output

- Bronbestanden: `README.md`, `docs/*.md` en `reports/*`
- Build script: `site/build.mjs`
- Build command: `npm run build`
- Output directory: `site/dist`
- Cloudflare projectnaam: `bozarc-site`
- Deploy command: `npx wrangler deploy --assets site/dist --name bozarc-site`

De site rendert de bestaande markdown-documenten naar een deelbare webpagina en kopieert de PDF en Excel naar de publieke output.

## Cloudflare Workers instellen

1. Ga in Cloudflare naar `Workers & Pages`.
2. Kies `Create application` en connecteer GitHub.
4. Selecteer de GitHub repo `boyddriesen/Bozarc`.
5. Gebruik deze instellingen:
   - Project name: `bozarc-site`
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy --assets site/dist --name bozarc-site`
   - Production branch: `main`
6. Deploy.

Elke push naar `main` bouwt daarna automatisch een nieuwe versie. Pull requests of branches kunnen als preview deployment gebruikt worden.

## Lokaal testen

```bash
npm run build
npx wrangler dev --assets site/dist --name bozarc-site --compatibility-date=2026-06-22
```

## Waarom niet direct AI naar live?

De veilige workflow blijft:

```text
AI voorstel -> GitHub PR -> review/merge -> Cloudflare Workers publiceert
```

Zo blijft GitHub de bron van waarheid en wordt de publieke klantpagina niet ongecontroleerd overschreven.
