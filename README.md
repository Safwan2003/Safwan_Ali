# Safwan_Ali

Personal portfolio for **Safwan Ali** — AI Engineer & Data Scientist (Karachi, Pakistan).

A single-page static site: plain HTML, one CSS file, one vanilla-JS file. **No build
step, no dependencies, no framework.** Google Fonts (Syne + Sora + Onest) are the
only remote asset.

## Concept

A dark, editorial record-label style. The hero is **Kage** — a fully procedural
WebGL night scene (`landing-pages/kage.html`, Three.js, no photos or video),
lazy-mounted only when it scrolls into view so the page is readable instantly and
on any device. Below the hero: a professional summary, the Med-GReF research
paper, experience, a **throwable card deck** for the project catalogue (drag, or
arrow keys), a technical-skills grid, a timeline / education table, and a contact
close.

Accessibility: all scroll/reveal motion is gated behind a `motion` class added
only when `prefers-reduced-motion` is not set, so the reduced-motion and no-JS
renders are the finished page. The deck is keyboard-operable.

## Structure

```
Safwan_Ali/
├── index.html                     # all page content
├── style.css                      # palette, layout, deck + research styling
├── script.js                      # hero lazy-mount, reveal observer, throwable deck
├── landing-pages/
│   ├── kage.html                  # procedural WebGL hero scene
│   └── secret-pathways-assets/    # fonts + three.js + foreground art for kage.html
└── assets/
    ├── SafwanAli_Resume.pdf
    └── Med-GReF_Paper.pdf
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
