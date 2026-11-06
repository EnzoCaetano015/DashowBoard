# Publishing and contributing

[← Back to README](../README.md)

## Landing page

The landing page lives in [`site/index.html`](../site/index.html), with styles, interactions, and assets alongside it. It is a static site with no installation or build step. Serve the `site` directory with a local HTTP server to review it in a browser.

The [`pages.yml`](../.github/workflows/pages.yml) workflow deploys only `site/` to GitHub Pages when that directory or the workflow changes on `main`. You can also run it manually from Actions.

Published page: <https://enzocaetano015.github.io/DashowBoard/>

### Deployment timeouts

The Pages job allows 30 minutes, with a 20-minute deployment timeout. Time spent in the GitHub Pages queue counts toward the deployment timeout. If artifact upload succeeds but deployment remains in `deployment_queued` or `updating_pages`, inspect the run logs and GitHub's service status before changing the site files. Start a new workflow run after the updated workflow reaches `main`; rerunning an older run uses its original commit and time limits.

The page links to GitHub's latest release for downloads. Its workspace preview is illustrative data, not a live account or uptime claim. Branding and glass materials follow the desktop app, including light and dark themes.

## Continuous integration

[`ci.yml`](../.github/workflows/ci.yml) validates pull requests and `main` changes on Windows. It runs frontend tests and builds, plus Rust formatting, checks, and tests.

## Releases

The manually dispatched [`release.yml`](../.github/workflows/release.yml) workflow builds Windows installers and publishes a GitHub Release. It must run from `main` with successful CI for the commit and takes:

- A version in `vMAJOR.MINOR.PATCH` format.
- An introduction for the release notes.

To build an installer locally:

```bash
pnpm tauri build
```

## Contributing

1. Fork and clone the repository.
2. Create a focused branch.
3. Install dependencies and validate your changes.
4. Explain the resulting behavior clearly.
5. Include screenshots or video for visual changes.
6. Open a pull request.

Read [`AGENTS.md`](../AGENTS.md) for project architecture and implementation rules. User-facing copy, accessibility labels, errors, and public documentation should be written in English.

When adding a provider, verify its official API contract, define typed requests and responses, keep integration calls behind their existing boundary, expose queries through the domain controller, and implement native credential handling where needed. Allow only required network endpoints, preserve independent failures, and normalize errors.

## Future work

- Expand integration coverage and incident/availability views.
- Improve local notifications and automated test coverage.
- Prepare installers for additional platforms.
