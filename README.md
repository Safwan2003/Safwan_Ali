# Safwan_Ali

Personal portfolio site for **Safwan Ali** — AI Engineer & Applied Researcher (Karachi, Pakistan).

A single-page static site built with plain HTML, CSS, and a small amount of vanilla
JavaScript — no build step, no dependencies. Editorial dark theme (Fraunces / Inter /
JetBrains Mono), scroll-reveal sections, and a scroll-spy navigation.

Sections: About · Research (interests, scope, featured thesis) · Experience ·
Projects · Skills · Education · Contact.

## Structure

```
Safwan_Ali/
├── index.html      # all page content
├── style.css       # dark theme, responsive layout
├── script.js       # footer year + scroll-spy nav
└── assets/
    ├── safwan.jpeg
    └── SafwanAli_Resume.pdf
```

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push to the `main` branch of `Safwan2003/Safwan_Ali`.
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The site publishes at `https://safwan2003.github.io/Safwan_Ali/`.

## Contact

- Email: safwanalimukaddam@gmail.com
- GitHub: https://github.com/Safwan2003
- LinkedIn: https://linkedin.com/in/safwan-ali-281aa1275
