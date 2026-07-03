# CareSense AI — Verkoopwebsite

Professionele one-page verkoopsite (single-page app) voor **CareSense AI**, waarin de vroegere
CareSense- en ADL-Actief-producten zijn samengebracht onder één merk.

**Uitstraling:** modern, professioneel zorgproduct — kalm medisch teal-groen met zachte,
licht groen-getinte neutralen; natuurlijk groen voor ADL-Actief, koel slate voor Sensoren.
Gecentreerde split-navigatie (logo in het midden), Lenis smooth scroll, woord-cascade
tekst-reveals op koppen, clip-reveals + parallax op beelden, logo-marquee en een
scroll-gestuurde "moving landing" video op de Sensoren-pagina.

## Structuur

```
caresense-ai-website/
├── index.html      # Alle pagina's ("views") + navigatie + footer
├── styles.css      # Volledig design system (teal/navy + groen ADL-accent)
├── app.js          # View-switching, scroll-animaties, tellers, video-scroll-effect, formulier
└── assets/
    ├── sensoren-hub.mp4     # Video voor het scroll-effect op de Sensoren-pagina
    ├── hub-*.png            # Productfoto's van de CareSense Hub
    ├── care-warm.webp       # Zorgfoto (CareSense / Over)
    ├── care-monitoring.jpg  # Zorgfoto (leefpatroonmonitoring)
    └── adl-volunteers.webp  # Vrijwilligersfoto (ADL-Actief)
```

## Pagina's (bovenin te bereiken; logo = terug naar de landingspagina)

1. **Home** – landingspagina met overzicht van het hele platform
2. **CareSense AI** – het dashboard voor verzorgenden
3. **ADL-Actief** – de vrijwilligersapp (telefoon-mockup)
4. **Sensoren** – video-scroll-effect van de hub + uitleg van de sensortypes
5. **Prijzen** – 3 abonnementen met maand/jaar-schakelaar + FAQ
6. **Wie wij zijn** – missie, kernwaarden, tijdlijn, team
7. **Contact** – contactformulier + gegevens

## Lokaal bekijken

Vanwege de video en afbeeldingen is een lokale webserver nodig (niet dubbelklikken):

```bash
cd caresense-ai-website
python3 -m http.server 8790
# open http://localhost:8790
```

## Sensorfoto's later toevoegen

De overige sensoren tonen nu een nette **"Foto volgt"**-placeholder. Zo vervang je die later:
1. Zet de foto in `assets/` (bijv. `assets/bewegingssensor.png`).
2. Zoek in `index.html` de betreffende `<div class="sensor-media placeholder">…</div>`.
3. Vervang die door: `<div class="sensor-media"><img src="assets/bewegingssensor.png" alt="Bewegingssensor"></div>`.

## Aandachtspunten

- Cijfers (1.200+ zorgprofessionals, 40+ locaties, telefoonnummer, e-mail, KvK) zijn plaatsvervangers —
  vervang ze door de echte gegevens.
- Het contactformulier toont nu een bevestiging in de browser; koppel het aan een echte
  mailservice/backend (bijv. Netlify Forms) voordat het live gaat.
```
