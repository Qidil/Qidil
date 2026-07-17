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
