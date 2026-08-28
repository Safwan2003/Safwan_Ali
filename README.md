# Safwan_Ali

Personal portfolio for **Safwan Ali** — AI Engineer & Data Scientist (Karachi, Pakistan).

The whole page is a **live WebGL scene**. A Kyoto-inspired night environment —
geometry, textures, normal maps, post-processing — is generated at runtime with
Three.js, and the portfolio content (about, projects, experience, contact) is set
into it as scroll-driven chapters with a giant 3D wordmark and camera moves.

No build step, no framework. The only assets are `three.min.js` and two subset
fonts, both served locally from `secret-pathways-assets/`.

## Structure

```
Safwan_Ali/
├── index.html                     # entire page — markup, CSS, and the WebGL scene
├── secret-pathways-assets/        # three.js, subset fonts, foreground art
└── assets/
    ├── SafwanAli_Resume.pdf
    └── Med-GReF_Paper.pdf
```

## Accessibility & fallback

- All scroll/reveal motion respects `prefers-reduced-motion`.
- If WebGL is unavailable the page drops to a static `no-webgl` render with the
  same content.
- The scroll rail and nav are keyboard-operable.

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
