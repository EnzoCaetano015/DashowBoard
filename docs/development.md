# Development

[← Back to README](../README.md)

## Requirements

- Node.js 24
- pnpm 11
- Stable Rust
- Tauri 2 prerequisites for your operating system

## Setup

```bash
git clone https://github.com/EnzoCaetano015/DashowBoard.git
cd DashowBoard
pnpm install
```

Run the desktop app with all native features:

```bash
pnpm tauri dev
```

Run a visual browser preview:

```bash
pnpm dev
```

Browser mode does not provide SQLite, native integrations, credential storage, or desktop notifications. Validate those features in Tauri.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite frontend. |
| `pnpm tauri dev` | Start the development desktop app. |
| `pnpm test` | Run frontend tests. |
| `pnpm build` | Check TypeScript and build the frontend. |
| `pnpm preview` | Serve the production frontend build. |
| `pnpm tauri build` | Generate native installers. |

Native checks:

```bash
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

There is currently no `lint` script. Do not run a native installer build for routine UI changes.

## Local database

`data.sqlite` is created in the application configuration directory. Incremental migrations run during initialization; never rewrite a published migration.

The app can reveal the local database and export a backup to Downloads. SQL belongs in `src/backend/sql`, uses parameters, and returns typed models. Keep persisted values and native wire contracts compatible when changing presentation labels.

## Theme previews

In browser development, use `/?theme=light#/integracoes` or `/?theme=dark#/integracoes` to preview the glass materials. The `theme` parameter does not persist settings or override desktop preferences. The former `tema` parameter is accepted for existing preview links.

## Landing page

The static site in `site/` uses local assets and no build step. Serve it with a local static HTTP server for browser QA. It supports light and dark themes, a mobile navigation menu, keyboard access, and reduced motion.

## Brand assets

- `src/img/logo.jpg`: logo with background.
- `src/img/logo_without_background.png`: transparent source logo.
- `app-icon.png`: native icon source, with reduced exterior margins.
- `src/img/logo-sidebar.png`: optimized 256 px asset for the sidebar and favicon.
- `src-tauri/icons`: generated platform icons.
- `site/assets/logo.png`: the landing page's optimized logo.

Regenerate native icons with `pnpm tauri icon app-icon.png`. The installed app icon changes when a new packaged version is installed; updating repository assets does not replace an already installed executable.

The transparent source was prepared with ImageGen from the supplied logo using this prompt:

> Background extraction for existing DashowBoard app logo. Preserve exactly the supplied rounded square blue glass terminal icon, cyan > and underscore, proportions, colors, highlights and blue glass interior. Remove ONLY the black outside background, make outside fully transparent. Do not redesign, do not add text. Crop outer empty margins closely so the rounded square fills 96% of square canvas with a tiny safe margin. Deliver a single centered icon with real alpha transparency.
