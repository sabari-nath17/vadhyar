<p align="center">
  <img src="docs/assets/vadhyar-banner.jpg" alt="Vadhyar — Understand what you build" width="600" />
</p>

# Vadhyar

**Understand the feature AI built. Make your next change yourself.**

A VS Code learning companion for beginners building with AI. Connect your requirement to relevant code, reason through its logic, make your own edit and check the result.

[Website](https://vadhyar-website.vercel.app) · [Download the extension](https://github.com/sabari-nath17/vadhyar/releases/download/v0.1.0/vadhyar-0.1.0.vsix) · [Installation guide](docs/installation.md)

## Install

1. Download `vadhyar-0.1.0.vsix` from [GitHub Releases](https://github.com/sabari-nath17/vadhyar/releases/tag/v0.1.0).
2. In VS Code: **Extensions → ⋯ → Install from VSIX…**.
3. Follow [the setup guide](docs/installation.md) to open the included learning project and configure Graphify.
4. Run **Vadhyar: Understand this change**. Add your own OpenAI API key through the secure native prompt for explanations and hints.

Requires **macOS Apple Silicon, VS Code 1.140.0+, Python 3.10+ and Graphify 0.9.84**. The pinned test runner is included. OpenAI API usage is billed separately.

## How it works

**Requirement → relevant source → prediction → observed behavior → your edit → executed checks.**

The coach supplies source-linked explanations and conceptual hints. You make the code change in the editor. Workspace-scoped records keep your checkpoints and activity; credentials use VS Code SecretStorage. Review the exact context before sharing it with OpenAI.

## Current release scope

Version 0.1.0 supports the included milestone approval project and three prepared ownership cases. Its intentionally seeded ownership bug is disclosed in the exercise. Arbitrary repositories, automatic repairs and broader Project Guide operations are not included. The website walkthrough is illustrative.

## Development and evidence

Use the [installation/source-build guide](docs/installation.md), [implementation plan](docs/implementation-plan.md), [task record](tasks/todo.md) and [release acceptance](docs/landing-release.md). Typecheck, lint, build and 36 product tests passed for the release source. Clean-profile installation, the installed check runner and real Graphify extraction were exercised. Package checks do not establish learning gains or fresh API acceptance.

Built for [DevDay Kochi](https://luma.com/z10nz8gp). [Event rules](RULES.md) · [AI usage](AI_USAGE.md) · [Change log](CHANGELOG.md) · [Source attribution](docs/reuse-sources.md). No project-wide license has been selected.
