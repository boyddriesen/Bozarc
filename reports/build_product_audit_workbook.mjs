import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = path.join(process.cwd(), "reports");
const outFile = path.join(outDir, "bozarc_productbrede_audit_concurrentie_en_google.xlsx");

const sources = [
  ["BOzARC hoofdsite", "https://www.bozarc.be/", "Aanbod, merk, contact en footer"],
  ["BOzARC sitemap", "https://www.bozarc.be/sitemap.html", "Productboom en interne pagina's"],
  ["BOzARC carport", "https://www.bozarc.be/carport.html", "Carport-hoofdpagina"],
  ["BOzARC mobilhome carport", "https://www.bozarc.be/carport/carport-voor-mobilhome.html", "Specifieke nichepagina"],
  ["BOzARC caravan carport", "https://www.bozarc.be/carport/carport-voor-caravan.html", "Specifieke nichepagina"],
  ["BOzARC terrasoverkapping", "https://www.bozarc.be/terrasoverkapping-in-aluminium.html", "Terrasoverkapping-hoofdpagina"],
  ["BOzARC glazen wanden", "https://www.bozarc.be/terrasoverkapping/glazen-wand-terras.html", "Accessoire/toepassing"],
  ["BOzARC Nova", "https://www.bozarc.be/nova/bozarc-nova.html", "Productlijn"],
  ["BOzARC Vista", "https://www.bozarc.be/vista/bozarc-vista.html", "Productlijn"],
  ["BOzARC serres", "https://www.bozarc.be/serres/aluminium-serres.html", "Serres en configurator"],
  ["BOzARC speelplaatsoverkapping", "https://www.bozarc.be/overkapping/speelplaatsoverkappingen.html", "B2B schooltoepassing"],
  ["BOzARC fietsenstalling", "https://www.bozarc.be/overkapping/fietsenstalling.html", "B2B fietsparkeren"],
  ["Ovalux", "https://ovalux.com/nl-be/", "Waalse/Belgische concurrent voor carports en pergola's"],
  ["Veranco", "https://www.veranco.be/", "Veranda, pergola, carport en B2B"],
  ["Winsol", "https://winsol.eu/nl-be/terrasoverkapping", "Terrasoverkapping en accessoires"],
  ["Harol", "https://www.harol.com/producten/terrasoverkappingen/", "Terrasoverkappingen, opties en FAQ"],
  ["Renson", "https://renson.net/nl-be/producten/terrasoverkapping", "Premium outdoor living, configurator, dealerroute"],
  ["AC Systems", "https://www.acsystems.be/", "Carports, terrasoverkappingen, deurluifels, rokersruimtes"],
  ["Easy-Matic", "https://www.easy-matic.be/", "B2B fietsenstalling, rokerspatio, opslag en wachtpatio"],
  ["Tuinmaximaal", "https://www.tuinmaximaal.be/glazen-schuifwand", "Retail/accessoire benchmark voor glaswanden"],
];

const summaryRows = [
  ["Auditdatum", "2026-06-23", "Publieke SERP-steekproef en websitebronnen; geen Search Console of rank tracker"],
  ["Hoofdconclusie", "BOzARC is zichtbaar, maar productbreed nog te weinig gestructureerd als koop- en antwoordpad", "Sterk op branded/specifiek, kwetsbaar op generiek/non-brand"],
  ["Sterkste SEO-kans", "Mobilhome/caravan carports", "Specifieke intentie en bestaande aparte pagina's"],
  ["Grootste concurrentiedruk", "Terrasoverkappingen/accessoires en B2B-overkappingen", "Veel sterke merken, retailspelers en B2B-specialisten"],
  ["Belangrijkste SEA-risico", "Te breed starten zonder marge/prioriteit/negatives", "Paid test smal houden, audit wel productbreed"],
  ["Belangrijkste GEO/AEO-risico", "Te weinig compacte keuzehulp/FAQ/vergelijking per product", "AI- en antwoordmachines hebben citeerbare blokken nodig"],
];

const competitionRows = [
  ["Productfamilie", "Relevante concurrenten", "Wat zij sterker brengen", "Wat BOzARC al heeft", "Risico", "Actie"],
  ["Carports auto", "Ovalux, Veranco, Verandair, AC Systems, Danenberg", "Duidelijke carportpositionering, offerteflow, soms prijs-/configuratiegevoel", "Eigen carportpagina, aluminium/polycarbonaat verhaal, dealerlaag", "Generieke carporttermen zijn druk bezet", "Maak carport-cluster met keuzehulp: auto, mobilhome, caravan, daktype, regio"],
  ["Mobilhome/caravan carports", "Ovalux, Verandair, Danenberg, niche-carportspelers", "Spreken camper/camping-car soms direct aan", "Aparte pagina's voor mobilhome en caravan", "Niche kan verdwijnen onder algemene carportcampagne", "Behandel als aparte SEO/SEA-cluster met FAQ en voorbeeldprojecten"],
  ["Terrasoverkappingen", "Winsol, Harol, Renson, Verano, Tuinmaximaal, Veranco", "Producttypes, inspiratie, FAQ, opties, brochure/configurator", "Sterke basispagina en veel subpagina's", "Hoge druk op generieke zoekwoorden", "Bouw beslissingspagina: dakvorm, glas/polycarbonaat, zonwering, wind, fundering"],
  ["Glas/zon/wind accessoires", "Tuinmaximaal, Winsol, Verano, Renson, zonweringsspecialisten", "Accessoirepagina's met voordelen, prijsgevoel, FAQ", "Eigen subpagina's en toepassing onder overkapping", "Kan losse prijszoekers aantrekken", "Positioneer als upsell bij BOzARC-totaalproject; negatieve termen bepalen"],
  ["Nova en Vista", "Renson, Harol, Winsol, Veranco, premium pergola/veranda-spelers", "Lifestyle, design, awards, technologie", "Eigen merkpagina's met brochure/offerte", "Non-brand zoeker begrijpt productnaam niet", "Vergelijk Nova vs Vista vs Original met concrete situaties"],
  ["Serres en tuinkamers", "Janssens, Euro-Serre, gespecialiseerde serrewebshops", "Configurator, standaard/custom modellen, serre-expertise", "Verdelerrol, configuratorlink en serrepagina's", "Fabrikant/specialist lijkt autoritairder", "Maak rol expliciet: officiele verdeler, advies, plaatsing, showroom"],
  ["B2B-overkappingen", "AC Systems, Easy-Matic, Vandendijk, Falco, VelopA, Storacon", "Sector- en aankoopgerichte taal", "Veel B2B-pagina's en toepassingen", "B2B-koper zoekt functioneler dan particulier", "Aparte B2B-route met sectoren, referenties, aankoopcriteria en kwalificatie"],
  ["Deurluifel/inkomhal/stockage", "AC Systems, D&C Terras, Easy-Matic, industriele aanbieders", "Use-case pagina's en offerteflow", "BOzARC heeft pagina's", "Kan als bijproduct gelezen worden", "Beslis: actief verkopen of ondersteunend tonen"],
];

const serpRows = [
  ["Producttak", "Voorbeeldquery", "Waargenomen patroon", "BOzARC-zichtbaarheid", "Implicatie"],
  ["Carports", "carport aluminium belgie", "BOzARC naast Ovalux, Verandair, Veranco, Danenberg en andere spelers", "Zichtbaar", "Sterke basis; keuzehulp en proof nodig om generiek beter te winnen"],
  ["Mobilhome carport", "carport mobilhome belgie aluminium", "Specifieke intentie toont BOzARC-pagina duidelijk", "Sterk/kansrijk", "Aparte nichecluster behouden"],
  ["Caravan carport", "carport caravan belgie aluminium", "BOzARC heeft specifieke pagina en zichtbaarheid", "Sterk/kansrijk", "FAQ en voorbeelden toevoegen"],
  ["Terrasoverkapping", "terrasoverkapping aluminium belgie", "BOzARC zichtbaar maar veel concurrentie van Winsol, Harol, Renson, Verano, Veranco", "Zichtbaar maar kwetsbaar", "Meer autoriteit, vergelijking en keuzehulp nodig"],
  ["Glazen wanden", "glazen wand terras overkapping belgie", "Non-brand resultaten tonen o.a. Tuinmaximaal, Winsol, Verano", "Sterker op branded/exact", "Als upsell positioneren; prijszoekers vermijden indien nodig"],
  ["Jacuzzi-overkapping", "jacuzzi overkapping belgie aluminium", "Spa-/retailspelers zichtbaar; BOzARC ook via oudere/nieuwsachtige paden", "Onregelmatig", "Actuele landingspagina sterker maken dan oude blog/tag-resultaten"],
  ["Zonwering", "zonwering terrasoverkapping belgie", "Tuinmaximaal, Verano en zonweringsspecialisten zichtbaar", "Kwetsbaar", "Alleen paid als losse accessoireleads gewenst zijn"],
  ["Windschermen", "windscherm terras overkapping belgie", "Specialisten/accessoireaanbieders zichtbaar", "Kwetsbaar", "Benadruk onderdeel van totaalproject"],
  ["Nova/Vista", "BOzARC Nova / BOzARC Vista", "Branded productpagina's bestaan", "Goed voor branded", "Non-brand uitleg mist: vertaal productnamen naar voordelen"],
  ["Serres", "aluminium serre belgie", "Janssens en serrespecialisten dragen meer autoriteit", "Aanwezig via serrepagina", "Verdelerrol en advieswaarde expliciet maken"],
  ["Speelplaatsoverkapping", "speelplaatsoverkapping belgie aluminium", "BOzARC naast AC Systems, Vandendijk en projectspelers", "Zichtbaar", "Sectorpagina voor scholen uitbouwen"],
  ["Fietsenstalling", "fietsenstalling aluminium overkapping belgie", "Easy-Matic, Falco, VelopA en andere B2B-specialisten sterk", "Zichtbaar maar kwetsbaar", "B2B-aankooproute functioneel maken"],
  ["Stockage/rokers/deurluifel", "stockage overkapping aluminium belgie / rokersruimte overkapping belgie", "B2B-specialisten spreken use-case directer aan", "Variabel", "Commercieel beslissen of dit actieve acquisitieproducten zijn"],
];

const seoRows = [
  ["Productfamilie", "SEO", "SEA", "GEO", "AEO", "Prioriteit"],
  ["Carports", "Consolidatie rond auto/mobilhome/caravan en technische keuzecriteria", "Startwaardig met aparte adgroups en negatives", "Citeerbaar uitleggen: aluminium, polycarbonaat, dakvorm, bescherming", "FAQ over vergunning, afmetingen, plaatsing, daktype, onderhoud", "Hoog"],
  ["Terrasoverkappingen", "Meer vergelijking: terrasoverkapping vs veranda/pergola/tuinkamer", "Startwaardig maar splits basis, offerte, plaatsing en opties", "Duidelijke beslissingshulp per situatie", "Antwoordblokken rond warmte, regen, fundering, dak, glaswanden", "Zeer hoog"],
  ["Accessoires", "Ondersteunende content rond totaalproject", "Alleen paid als losse accessoireleads gewenst zijn", "Zonwering/windscherm/glaswand als comfortlaag uitleggen", "FAQ per accessoire: wanneer nodig, combineerbaar, opties", "Middel"],
  ["Nova/Vista", "Branded ok, non-brand zwakker", "Niet breed adverteren zonder productuitleg", "Productnamen vertalen naar categorieen/voordelen", "Vergelijk Nova vs Vista vs Original", "Hoog"],
  ["Serres", "BOzARC als Janssens-verdeler met advies/showroom/configurator", "Pas na marge/prioriteit", "Action/custom en verdelerrol helder maken", "FAQ over serre vs tuinkamer, configurator, accessoires", "Middel"],
  ["B2B-overkappingen", "Aparte B2B-informatiestructuur nodig", "Apart houden van B2C; leads kwalificeren", "Use-cases citeerbaar per sector", "FAQ over veiligheid, maatwerk, doorlooptijd, onderhoud, materialen", "Hoog"],
];

const productRows = [
  ["Categorie", "Pagina", "URL", "Title/H1-signaal", "CTA-signaal", "Auditnotitie"],
  ["Carports", "Carport", "https://www.bozarc.be/carport.html", "Title/H1 duidelijk: aluminium carport voor voertuig", "Veel offerte/brochure/contact-termen", "Goede basis; sterker maken met keuzehulp en vergelijking"],
  ["Carports", "Carport voor auto", "https://www.bozarc.be/carport/carport-in-aluminium.html", "Title/H1 duidelijk rond auto en bescherming", "Veel CTA's", "Gebruik als specifieke landingspagina, niet alleen subpagina"],
  ["Carports", "Carport mobilhome", "https://www.bozarc.be/carport/carport-voor-mobilhome.html", "Title/H1 zeer specifiek", "Veel CTA's", "Kansrijke niche; aparte campagne/adgroup waard"],
  ["Carports", "Carport caravan", "https://www.bozarc.be/carport/carport-voor-caravan.html", "Title/H1 zeer specifiek", "Veel CTA's", "Kansrijke niche; FAQ en voorbeelden toevoegen"],
  ["Terras", "Terrasoverkapping aluminium", "https://www.bozarc.be/terrasoverkapping-in-aluminium.html", "Title/H1 duidelijk", "Veel CTA's", "Sterk clusteranker, maar meer vergelijking nodig"],
  ["Terras", "Glazen wand terras", "https://www.bozarc.be/terrasoverkapping/glazen-wand-terras.html", "Title/H1 duidelijk rond glazen wanden", "Veel CTA's", "Goed als upsell; non-brand accessoireconcurrentie hoog"],
  ["Terras", "Jacuzzi overkapping", "https://www.bozarc.be/terrasoverkapping/overkapping-jacuzzi.html", "Title/H1 duidelijk rond jacuzzi", "Veel CTA's", "Actualiteit/duplicaten met oude blogpaden controleren"],
  ["Terras", "Zonwering", "https://www.bozarc.be/terrasoverkapping/zonwering.html", "Title/H1 rond verkoeling", "Veel CTA's", "Duidelijk maken of losse zonweringleads gewenst zijn"],
  ["Terras", "Windschermen", "https://www.bozarc.be/terrasoverkapping/windschermen.html", "Title/H1 rond comfort", "Veel CTA's", "Positioneer als onderdeel van totaalproject"],
  ["Terras", "Pergola/veranda/tuinkamer", "Meerdere BOzARC subpagina's", "Duidelijke titles maar overlappende intentie", "Veel CTA's", "Vergelijk deze termen in een keuzehulptabel"],
  ["Nova", "BOzARC Nova", "https://www.bozarc.be/nova/bozarc-nova.html", "Branded title/H1, voordelen in bullets", "Offerte en brochure sterk", "Vertaal productnaam naar non-brand kooptaal"],
  ["Vista", "BOzARC Vista", "https://www.bozarc.be/vista/bozarc-vista.html", "Branded title/H1", "Offerte en brochure sterk", "Vergelijk Vista met Nova/Original"],
  ["Serres", "Aluminium serres", "https://www.bozarc.be/serres/aluminium-serres.html", "Action/custom en configurator aanwezig", "Brochure/configurator", "BOzARC-rol als verdeler explicieter maken"],
  ["B2B", "Speelplaatsoverkapping/fietsenstalling", "BOzARC B2B subpagina's", "Specifieke use-case pagina's", "Contact/offerte", "Sector- en aankoopgerichte route nodig"],
];

function colLetter(index) {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function writeRows(sheet, rows, widths = []) {
  const range = sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length);
  range.values = rows;
  range.format = { wrapText: true };
  range.format.borders = { preset: "inside", style: "thin", color: "#D9E0D9" };
  sheet.getRangeByIndexes(0, 0, 1, rows[0].length).format = {
    fill: "#1F6F58",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
  sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length).format.borders = {
    preset: "outside",
    style: "thin",
    color: "#9FB5AA",
  };
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rows.length, 1).format.columnWidth = width;
  });
  sheet.freezePanes.freezeRows(1);
  sheet.showGridLines = false;
}

function addTable(sheet, rows, name) {
  const address = `A1:${colLetter(rows[0].length - 1)}${rows.length}`;
  const table = sheet.tables.add(address, true, name);
  table.style = "TableStyleMedium2";
  table.showFilterButton = true;
}

const workbook = Workbook.create();

const readme = workbook.worksheets.add("README");
writeRows(readme, [
  ["Veld", "Waarde", "Toelichting"],
  ["Bestand", "BOzARC productbrede audit", "Concurrentieaudit + Google/SEO/SEA/GEO/AEO audit"],
  ["Datum", "2026-06-23", "Momentopname"],
  ["Scope", "Alle huidige productfamilies", "Carports, terrasoverkappingen, Nova, Vista, serres, B2B en accessoires"],
  ["Belangrijke beperking", "Geen rank tracker of Search Console", "Publieke SERP-steekproeven zijn richtinggevend, niet definitief"],
  ["Gebruik", "Besprekingsdocument", "Beslis per productfamilie prioriteit, marge, regio, taal en gewenste leadkwaliteit"],
], [22, 34, 82]);

const summary = workbook.worksheets.add("Audit samenvatting");
writeRows(summary, [["KPI", "Bevinding", "Waarom dit telt"], ...summaryRows], [28, 48, 88]);
addTable(summary, summaryRows.length ? [["KPI", "Bevinding", "Waarom dit telt"], ...summaryRows] : [], "AuditSummaryTable");

const competition = workbook.worksheets.add("Concurrentieaudit");
writeRows(competition, competitionRows, [24, 42, 54, 48, 42, 58]);
addTable(competition, competitionRows, "CompetitionAuditTable");

const serp = workbook.worksheets.add("SERP steekproef");
writeRows(serp, serpRows, [24, 38, 62, 26, 62]);
addTable(serp, serpRows, "SerpSampleTable");

const seo = workbook.worksheets.add("SEO SEA GEO AEO");
writeRows(seo, seoRows, [26, 48, 48, 48, 48, 18]);
addTable(seo, seoRows, "SeoSeaGeoAeoTable");

const products = workbook.worksheets.add("Productpagina check");
writeRows(products, productRows, [22, 34, 54, 42, 28, 58]);
addTable(products, productRows, "ProductPageCheckTable");

const sourceSheet = workbook.worksheets.add("Bronnen");
writeRows(sourceSheet, [["Bron", "URL", "Gebruik"], ...sources], [32, 72, 58]);
addTable(sourceSheet, [["Bron", "URL", "Gebruik"], ...sources], "SourcesTable");

for (const sheet of workbook.worksheets.items) {
  const used = sheet.getUsedRange();
  used.format.autofitRows();
}

await fs.mkdir(outDir, { recursive: true });

for (const sheetName of ["README", "Audit samenvatting", "Concurrentieaudit", "SERP steekproef", "SEO SEA GEO AEO", "Productpagina check", "Bronnen"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(
    path.join(outDir, `.qa_${sheetName.replaceAll(" ", "_").toLowerCase()}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 200 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outFile);
console.log(outFile);
