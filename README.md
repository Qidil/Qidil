<p align="center">
  <picture>
    <source media="(max-width: 760px) and (prefers-color-scheme: dark)" srcset="./assets/hero/portfolio-card-b93126f2-mobile-dark.svg">
    <source media="(max-width: 760px)" srcset="./assets/hero/portfolio-card-b93126f2-mobile-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/portfolio-card-b93126f2-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/hero/portfolio-card-b93126f2-light.svg">
    <img src="./assets/hero/portfolio-card-b93126f2-dark.svg" alt="Aidhil Prima Abdiguna - Frontend Developer & Half Vibe Coder" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://portofolio-aidhil-pa.netlify.app"><img alt="My Web Portofolio" src="https://img.shields.io/badge/My_Web_Portofolio-FYI_Here-FFD700?style=for-the-badge"></a>
</p>

---

## About This Repo

This is a web-based version of [GitHub Profile Agent Console](https://github.com/wildanniam/GitHub-Profile-Console) by [Wildan Syukri Niam](https://github.com/wildanniam). Instead of a CLI wizard, this version provides a browser-based form UI to generate your animated GitHub Profile README.

### What's Different

| Original (CLI) | This Version (Web UI) |
|---|---|
| `npm run setup` (terminal wizard) | `npm run dev` (browser form) |
| CLI-based input | Visual form with live character count |
| Manual file handling | Auto-save README.md to root |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Qidil/Qidil.git
cd Qidil
npm install
```

### 2. Run Dev Server

```bash
npm run dev
```

Browser will open at `http://localhost:5173`

### 3. Fill the Form

- Upload your **portrait image** (PNG with transparent background)
- Fill in all profile fields (each field shows character limits)
- Click **Generate**

### 4. Save & Push

- Click **Save README.md to Root** to write the file
- Push to your GitHub profile repo:

```bash
git add README.md assets/hero
git commit -m "Update profile"
git push
```

Your profile will appear at `https://github.com/YOUR_USERNAME`

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start web UI (form + preview) |
| `npm run generate` | CLI: generate from config file |
| `npm run validate` | Validate configuration |

## Tech Stack

- **Frontend:** Vite + React
- **Backend:** Express.js
- **Image Processing:** sharp
- **Output:** Animated SVG + README.md

## Credits

Original project: [GitHub Profile Agent Console](https://github.com/wildanniam/GitHub-Profile-Console) by [Wildan Syukri Niam](https://github.com/wildanniam)

Web UI adaptation by [Qidil](https://github.com/Qidil)

## License

[MIT](./LICENSE)
