# 7. Cloudflare Workers publicatie

Deze repo is voorbereid om als kleine research-microsite via Cloudflare Workers static assets te draaien.

## Bron en output

- Bronbestanden: `README.md`, `docs/*.md` en `reports/*`
- Build script: `site/build.mjs`
- Build command: `npm run build`
- Output directory: `site/dist`
- Cloudflare projectnaam: `bozarc-site`
- Deploy command: `npx wrangler deploy`

De site rendert de bestaande markdown-documenten naar een deelbare webpagina en kopieert de PDF en Excel naar de publieke output.

## Wachtwoordbeveiliging

De site staat achter HTTP Basic Auth (`site/worker.js`), want de downloads bevatten gevoelige info (budget, service fee, concurrentie-intel). Het wachtwoord wordt **niet** in de repo bewaard, maar als Cloudflare-secret:

```bash
npx wrangler secret put SITE_PASSWORD
# vul in: triscalis
```

Zonder dit secret antwoordt de site met een 500-foutmelding. Voor lokaal testen staat het wachtwoord in `.dev.vars` (genegeerd door git, niet aanpassen in de repo zelf).

## Cloudflare Workers instellen

1. Ga in Cloudflare naar `Workers & Pages`.
2. Kies `Create application` en connecteer GitHub.
4. Selecteer de GitHub repo `boyddriesen/Bozarc`.
5. Gebruik deze instellingen:
   - Project name: `bozarc-site`
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Production branch: `main`
6. Stel het `SITE_PASSWORD`-secret in via `npx wrangler secret put SITE_PASSWORD` (of in Cloudflare onder Settings → Variables and Secrets). Zonder dit secret werkt de site niet.
7. Deploy.

Elke push naar `main` bouwt daarna automatisch een nieuwe versie. Pull requests of branches kunnen als preview deployment gebruikt worden.

## Lokaal testen

```bash
npm run build
npx wrangler dev
```

Lokaal wordt het wachtwoord uit `.dev.vars` gelezen (niet uit Cloudflare).

## Waarom niet direct AI naar live?

De veilige workflow blijft:

```text
AI voorstel -> GitHub PR -> review/merge -> Cloudflare Workers publiceert
```

Zo blijft GitHub de bron van waarheid en wordt de publieke klantpagina niet ongecontroleerd overschreven.
