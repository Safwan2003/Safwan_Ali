# Safwan_Ali

Personal portfolio for **Safwan Ali** — AI Engineer & Applied Researcher (Karachi, Pakistan).

A single-page static site: plain HTML, one CSS file, one vanilla-JS file. No build
step, no dependencies, no framework. Google Fonts (Syne + Sora) are the only remote
asset.

## Concept

A dark record-label style. The hero is a **portal** — two panels part on scroll to
uncover the field behind while the wordmark grows, tightens its tracking, and its
two halves travel to opposite edges. Every portal value is bound to scroll
*position*, so it closes again on the way back up. Below: a full-height statement,
a **throwable card deck** for the project catalogue (drag, or arrow keys), a
hairline practice roster, a timeline table, and a close whose wordmark is cropped
by the page edge.

Accessibility: all scroll/reveal motion is gated behind a `motion` class added only
when `prefers-reduced-motion` is not set, so the reduced-motion and no-JS renders
are the finished page. The deck is keyboard-operable.

## Structure

```
Safwan_Ali/
├── index.html      # all page content
├── style.css       # palette, portal + deck styling, responsive rules
├── script.js       # scroll-driven portal, reveal observer, throwable deck
└── assets/
    ├── SafwanAli_Resume.pdf
    ├── Med-GReF_Paper.pdf
    ├── med-gref-architecture.png
    └── safwan.jpeg              # AMD hackathon certificate (not currently used)
```

## Palette

Ground `#0A0C0E` · ink `#EDE7DC` · muted `#6C7378` · amber `#E8913C` · teal
`#2E6B72` · hairlines `rgba(237,231,220,.13)`. Accents appear only on type, a dot,
or a rule.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (GitHub Pages)

Repo **Settings → Pages → Deploy from a branch → `main` / root**. Publishes at
`https://safwan2003.github.io/Safwan_Ali/`.

## Contact

- safwanalimukaddam@gmail.com
- https://github.com/Safwan2003
- https://linkedin.com/in/safwan-ali-281aa1275
