# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem, KeepTogether
)
from reportlab.platypus.flowables import Flowable

# ---------- Palette ----------
INK = colors.HexColor("#1F2937")        # dark slate - main text / headers
ACCENT = colors.HexColor("#2563EB")     # blue accent
ACCENT_SOFT = colors.HexColor("#DBEAFE")
MUTED = colors.HexColor("#6B7280")
LINE = colors.HexColor("#E5E7EB")
BOX_BG = colors.HexColor("#F3F4F6")
WARN_BG = colors.HexColor("#FEF3C7")
WARN_INK = colors.HexColor("#92400E")
GOOD_BG = colors.HexColor("#DCFCE7")
GOOD_INK = colors.HexColor("#166534")

PAGE_W, PAGE_H = A4

styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    name="CoverTitle", fontName="Helvetica-Bold", fontSize=30, leading=36,
    textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle", fontName="Helvetica", fontSize=14, leading=20,
    textColor=MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="CoverMeta", fontName="Helvetica", fontSize=10.5, leading=15,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="H1", fontName="Helvetica-Bold", fontSize=18, leading=22,
    textColor=INK, spaceBefore=4, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H2", fontName="Helvetica-Bold", fontSize=12.5, leading=16,
    textColor=INK, spaceBefore=14, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Body", fontName="Helvetica", fontSize=10, leading=14.5,
    textColor=INK, spaceAfter=6, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="BodySmall", fontName="Helvetica", fontSize=9, leading=13,
    textColor=MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="BulletItem", fontName="Helvetica", fontSize=10, leading=14.5,
    textColor=INK, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="KickerNum", fontName="Helvetica-Bold", fontSize=9, leading=11,
    textColor=ACCENT, spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="TableHead", fontName="Helvetica-Bold", fontSize=8.7, leading=11,
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="TableCell", fontName="Helvetica", fontSize=8.7, leading=11.5,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableCellBold", fontName="Helvetica-Bold", fontSize=8.9, leading=11.5,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="PlaceholderLabel", fontName="Helvetica-Oblique", fontSize=9.5, leading=13,
    textColor=MUTED, alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="RecoTitle", fontName="Helvetica-Bold", fontSize=11, leading=14,
    textColor=INK, spaceAfter=2,
))


def screenshot_placeholder(label, height=42):
    """A clearly marked drop-in box for a screenshot the user adds later."""
    t = Table(
        [[Paragraph(f"\U0001F4F7&nbsp;&nbsp;{label}", styles["PlaceholderLabel"])]],
        colWidths=[PAGE_W - 2 * 22 * mm],
        rowHeights=[height * mm],
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BOX_BG),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    return t


def section_kicker(num, title):
    return [
        Paragraph(f"ONDERDEEL {num}", styles["KickerNum"]),
        Paragraph(title, styles["H1"]),
        HRFlowable(width="100%", thickness=1.1, color=ACCENT, spaceAfter=12),
    ]


def callout(text, kind="info"):
    bg = {"info": ACCENT_SOFT, "warn": WARN_BG, "good": GOOD_BG}[kind]
    ink = {"info": INK, "warn": WARN_INK, "good": GOOD_INK}[kind]
    style = ParagraphStyle("calloutstyle", parent=styles["Body"], textColor=ink, spaceAfter=0)
    t = Table([[Paragraph(text, style)]], colWidths=[PAGE_W - 2 * 22 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(i, styles["BulletItem"]), bulletColor=ACCENT) for i in items],
        bulletType="bullet", start="•", leftIndent=12, bulletFontSize=8,
    )


story = []

# =========================================================
# COVER PAGE
# =========================================================
story.append(Spacer(1, 60 * mm))
story.append(Paragraph("BOZARC", ParagraphStyle(
    "logo", fontName="Helvetica-Bold", fontSize=13, textColor=ACCENT, spaceAfter=14, tracking=2)))
story.append(Paragraph("Analyse website &amp; marketingkanalen", styles["CoverTitle"]))
story.append(Paragraph("Een kritische blik op de huidige online aanwezigheid, gepositioneerd"
                        " tegenover de markt — met concrete aanbevelingen als vertrekpunt"
                        " voor een verdere samenwerking.", styles["CoverSubtitle"]))
story.append(Spacer(1, 30 * mm))
story.append(HRFlowable(width="35%", thickness=1.4, color=ACCENT, hAlign="LEFT"))
story.append(Spacer(1, 6))
story.append(Paragraph("Strategisch voorstel — 22 juni 2026", styles["CoverMeta"]))
story.append(Paragraph("Vertrouwelijk document, opgesteld ter voorbereiding van de samenwerking met Bozarc.",
                        styles["CoverMeta"]))
story.append(PageBreak())

# =========================================================
# 1. INLEIDING
# =========================================================
story += section_kicker("1", "Inleiding")
story.append(Paragraph(
    "Dit document geeft een eerste, doelbewust beknopte analyse van de huidige website en "
    "marketinginspanningen van Bozarc, aangevuld met een blik op de concurrentie. Het doel is niet "
    "om tot in detail elk pixel te beoordelen, maar om aan te tonen dat we het merk, de doelgroep en "
    "de markt waarin Bozarc speelt goed begrijpen — als stevige basis voor een verdere samenwerking.",
    styles["Body"]))
story.append(Spacer(1, 6))
story.append(callout(
    "Leeswijzer: onderdeel 2 en 3 bekijken de huidige website en marketingkanalen, onderdeel 4 "
    "benchmarkt Bozarc tegenover vier directe concurrenten, onderdeel 5 schetst de doelgroep, en "
    "onderdeel 6 bundelt de concrete aanbevelingen.", "info"))
story.append(Spacer(1, 14))

# =========================================================
# 2. WEBSITE-ANALYSE
# =========================================================
story += section_kicker("2", "De huidige website")
story.append(screenshot_placeholder("Schermafbeelding: homepage bozarc.be"))
story.append(Spacer(1, 8))

story.append(Paragraph("Verouderde branding, weinig karakter", styles["H2"]))
story.append(Paragraph(
    "De website oogt sterk verouderd: een grijze, functionele uitstraling zonder veel visuele "
    "identiteit. Er wordt vooral getoond <i>wat</i> Bozarc maakt, maar nauwelijks <i>waarom</i> en "
    "<i>hoe</i> ze dat doen — terwijl net dat de basis vormt voor herkenbaarheid en vertrouwen. "
    "Bezoekers die op zoek zijn naar een terrasoverkapping of carport kennen de algemene voordelen "
    "doorgaans al; het merkverhaal en de geloofwaardigheid maken het verschil.", styles["Body"]))

story.append(KeepTogether([
    Paragraph("Verwarrende navigatie en structuur", styles["H2"]),
    screenshot_placeholder("Schermafbeelding: hoofdmenu met Carports, Terrasoverkappingen, Nova, Vista, Serres, B2B"),
    Spacer(1, 8),
    Paragraph(
        "Het hoofdmenu combineert drie verschillende soorten logica op hetzelfde niveau: productcategorieën "
        "(Carports, Terrasoverkappingen, Serres), merknamen (Nova, Vista) én een apart B2B-luik waarin "
        "diezelfde producten opnieuw opduiken. Voor een bezoeker is hierdoor niet meteen duidelijk via "
        "welk pad hij moet gaan, of wat het verschil is tussen bijvoorbeeld een 'Terrasoverkapping' en 'Vista'.",
        styles["Body"]),
    bullets([
        "Producten zijn op minstens drie verschillende manieren bereikbaar (categorie, merk, B2B).",
        "Geen duidelijk pad van 'ik heb interesse' naar een concrete volgende stap.",
        "Sterk punt: realisaties en projectfoto's zijn aanwezig en tonen vakmanschap — alleen ontbreekt "
        "er een verhaal of duidelijke call-to-action rond die beelden.",
    ]),
]))

# =========================================================
# 3. MARKETINGKANALEN
# =========================================================
story.append(PageBreak())
story += section_kicker("3", "De huidige marketingkanalen")

story.append(Paragraph("Google Ads — het belangrijkste kanaal", styles["H2"]))
story.append(Paragraph(
    "Bozarc investeert momenteel een aanzienlijk budget van ongeveer <b>€10.000 à €15.000 per maand</b> "
    "in Google Ads, en dat kanaal levert vandaag het grootste deel van de leads. De resultaten liggen "
    "echter merkbaar lager dan voorheen.", styles["Body"]))
story.append(callout(
    "Onze inschatting: dit heeft minder te maken met het kanaal zelf, en meer met wat er na de klik "
    "gebeurt. Een verouderde, verwarrende website converteert duur betaald verkeer minder goed — "
    "zeker nu de concurrentie qua uitstraling en gebruiksgemak een stuk verder staat (zie onderdeel 4).",
    "warn"))
story.append(Spacer(1, 6))

story.append(Paragraph("Social media — aanwezig, maar onbenut", styles["H2"]))
story.append(screenshot_placeholder("Schermafbeelding: Facebook/Instagram-posts van Bozarc"))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Bozarc is actief op Facebook, Instagram en LinkedIn, maar de invulling blijft beperkt tot het "
    "delen van projectfoto's met een korte, vaak feitelijke of seizoensgebonden tekst. Er is geen "
    "duidelijke tone of voice of merkpersoonlijkheid merkbaar.", styles["Body"]))
story.append(bullets([
    "Posts genereren weinig interactie buiten de betrokken klant en hun directe omgeving.",
    "Social media wordt nu louter transactioneel ingezet (project tonen), niet als kanaal om "
    "vertrouwen, expertise en 'de mensen achter het merk' te tonen.",
    "Net dat laatste is wat potentiële klanten over de streep trekt om voor Bozarc te kiezen "
    "boven een concurrent.",
]))

story.append(Paragraph("Meetbaarheid", styles["H2"]))
story.append(Paragraph(
    "Er is momenteel geen toegang tot Google Analytics of Search Console om de resultaten van de "
    "website en de advertentiecampagnes objectief te onderbouwen. Dit wordt meegenomen als aandachtspunt "
    "in de aanbevelingen.", styles["Body"]))

# =========================================================
# 4. CONCURRENTIE-BENCHMARK
# =========================================================
story.append(PageBreak())
story += section_kicker("4", "Bozarc tegenover de markt")
story.append(Paragraph(
    "Vier directe concurrenten — MiniFlat, Veranco, Winsol en Harol — laten zien waar de markt vandaag "
    "staat. Bij elk van hen valt een gelijkaardig patroon op: heldere, productgerichte navigatie, een "
    "warme/lifestyle-gerichte tone of voice, en laagdrempelige online tools die bezoekers meteen "
    "betrekken vóór er een offerte wordt aangevraagd.", styles["Body"]))
story.append(Spacer(1, 8))

comp_header = ["", "Bozarc (vandaag)", "MiniFlat", "Veranco", "Winsol", "Harol"]
comp_rows = [
    ["Branding / tone of voice", "Grijs, technisch, weinig karakter",
     "Dromerig, persoonlijk", "Warm, familiaal, vakmanschap",
     "Premium, lifestyle-gericht", "Modern, expert maar toegankelijk"],
    ["Navigatie", "Merken, producten en B2B gemengd",
     "Helder per product", "Helder per product", "Helder, met klantsegmenten",
     "Helder + apart luik 'professionelen'"],
    ["Online tool / configurator", "Geen", "Prijssimulator + 3D-render",
     "Geen", "Budgetcalculator + simulatoren", "Productzoeker + offertetool"],
    ["Social media", "Enkel projectfoto's", "—", "—", "—", "—"],
    ["Vertrouwenselementen", "Beperkt", "Testimonials, garantie",
     "Familiebedrijf sinds 1983", "145 jaar historiek, awards",
     "80 jaar historiek, design awards"],
]

col_widths = [33 * mm, 27 * mm, 27 * mm, 27 * mm, 27 * mm, 27 * mm]
table_data = [[Paragraph(c, styles["TableHead"]) for c in comp_header]]
for row in comp_rows:
    table_data.append([Paragraph(row[0], styles["TableCellBold"])] +
                       [Paragraph(c, styles["TableCell"]) for c in row[1:]])

comp_table = Table(table_data, colWidths=col_widths, repeatRows=1)
comp_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), INK),
    ("BACKGROUND", (1, 1), (1, -1), WARN_BG),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("GRID", (0, 0), (-1, -1), 0.6, LINE),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (1, 1), (-1, -1), [colors.white, BOX_BG]),
    ("BACKGROUND", (1, 1), (1, -1), WARN_BG),
]))
story.append(comp_table)
story.append(Spacer(1, 10))
story.append(Paragraph(
    "MiniFlat springt er specifiek uit: een jong, sterk online-minded merk met een eigen "
    "configurator, dat daarmee duidelijk een groeiend, jonger publiek aanspreekt en — volgens eigen "
    "bronnen — een sterke toename in leads optekent.", styles["BodySmall"]))
story.append(Spacer(1, 6))
story.append(screenshot_placeholder("Voorbeeldschermen: miniflat.com / veranco.be / winsol.eu / harol.com", height=55))

# =========================================================
# 5. DOELGROEP
# =========================================================
story.append(PageBreak())
story += section_kicker("5", "Doelgroep en seizoenspatroon")

story.append(Paragraph("B2C — particulieren", styles["H2"]))
story.append(bullets([
    "Huiseigenaars die net verbouwd, verhuisd of gebouwd hebben, of een gezinsuitbreiding hebben "
    "doorgemaakt en nood hebben aan extra ruimte (bv. veranda).",
    "Terrasoverkappingen zijn sterk seizoensgebonden: de meeste aanvragen komen in de lente binnen, "
    "in aanloop naar de zomer.",
    "Carports zijn jaarrond relevant, zonder uitgesproken seizoenspiek.",
]))

story.append(Paragraph("B2B", styles["H2"]))
story.append(bullets([
    "Winkels die een luifel boven hun gevel willen.",
    "Scholen en bedrijven die speelplaatsen, terreinen of pleinen willen overkappen.",
    "Overheidsinstanties en gemeentes met gelijkaardige projecten.",
]))
story.append(Spacer(1, 4))
story.append(callout(
    "Deze twee doelgroepen vragen elk hun eigen taal, kanalen en bewijslast (bv. referentieprojecten "
    "voor B2B versus inspiratie en sfeer voor B2C) — iets wat in de huidige website niet wordt "
    "onderscheiden.", "info"))

# =========================================================
# 6. AANBEVELINGEN
# =========================================================
story.append(PageBreak())
story += section_kicker("6", "Aanbevelingen")
story.append(Paragraph(
    "Op basis van deze analyse stellen we een gefaseerde aanpak voor, die start bij het merk zelf "
    "en van daaruit vertaalt naar website en marketing.", styles["Body"]))
story.append(Spacer(1, 8))

recos = [
    ("1. Start met een merk- en strategieworkshop",
     "Een gezamenlijke workshopdag met het Bozarc-team, vertrekkend van het Golden Circle-model "
     "(why – how – what), om het merkverhaal scherp te stellen en korte- en langetermijndoelstellingen "
     "vast te leggen. Dit vormt de fundering voor elke volgende stap."),
    ("2. Herstructureer de website-navigatie",
     "Eén heldere, doelgroep- en productgerichte structuur in plaats van de huidige mix van merken, "
     "producten en B2B — naar het voorbeeld van Veranco, Winsol en Harol."),
    ("3. Vernieuw de branding en tone of voice",
     "Een moderne, herkenbare visuele identiteit en taal die vertrouwen en karakter uitstraalt, en "
     "het merk dichter bij de doelgroep brengt — zoals MiniFlat dat doet voor een jonger publiek."),
    ("4. Voeg een laagdrempelige online tool toe",
     "Een eenvoudige prijssimulator of configurator als eerste interactiemoment, vóór een formele "
     "offerteaanvraag — dit verlaagt de drempel en sluit aan bij wat de sterkste concurrenten al doen."),
    ("5. Herpositioneer social media",
     "Van puur projectfoto's naar een kanaal dat het merk, de mensen en de werkwijze toont — om "
     "geloofwaardigheid en vertrouwen op te bouwen vóór het eerste contact."),
    ("6. Zet meetbaarheid op poten",
     "Analytics en conversietracking correct laten opzetten, zodat het bestaande Google Ads-budget "
     "voortaan onderbouwd kan worden bijgestuurd in plaats van blind ingezet."),
]

for title, body in recos:
    block = [
        Paragraph(title, styles["RecoTitle"]),
        Paragraph(body, styles["Body"]),
        Spacer(1, 6),
    ]
    story.append(KeepTogether(block))

# =========================================================
# 7. VOLGENDE STAPPEN
# =========================================================
story.append(Spacer(1, 8))
story += section_kicker("7", "Voorgestelde volgende stap")
story.append(callout(
    "We stellen voor om te starten met de gezamenlijke merk- en strategieworkshop. Dat geeft ons "
    "scherpe, gedragen doelstellingen om een concreet plan van aanpak voor website en marketing op "
    "te bouwen — afgestemd op wat Bozarc op korte en lange termijn wil bereiken.", "good"))

doc = SimpleDocTemplate(
    "Bozarc_Analyse_Website_Marketing.pdf",
    pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm,
    topMargin=20 * mm, bottomMargin=18 * mm,
    title="Bozarc - Analyse website en marketingkanalen",
)
doc.build(story)
print("PDF gegenereerd.")
