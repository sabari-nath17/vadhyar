# Vadhyar landing and installer plan

Goal: publish a direct, responsive website with a real GitHub installer and clear setup.

## Scope and design

Use supplied design-v2.md visual language: parchment, charcoal, ochre action, terracotta/teal evidence, local Inter/Playfair, flat 2px sticker borders, 12px corners, authored lotus Guide. Adapt it to a marketing page; do not change extension behavior. No copied mascot, invented users, scores, learning gains or testimonials.

Release the completed S7 source checkpoint (21fdcc9) as the initial 0.1.0 learning release. Ongoing mixed extension changes remain a separate development state. Early release supports prepared milestone, not arbitrary repositories. The website interaction is an explicitly labelled example, not a live execution or API call.

## Implementation tasks

- [x] Build website/index.html, styles.css, app.js and assets; a six-step illustrative walkthrough, installation section and native FAQ.
- [x] Package the completed extension in an isolated clone, including pinned runtime test dependencies. Record Graphify setup at the installed extension location and exact VS Code requirement.
- [x] Write docs/installation.md and release README, SHA256 and release notes. Verify source tests/build and VSIX contents/clean-profile install.
- [x] Commit and publish authorized website/release files from the isolated clone. Keep local parent index, branch, source and ongoing changes intact.
- [x] Deploy static website to Vercel and verify desktop/mobile, keyboard, reduced motion, links and live asset loading.

## Review focus

Missing GitHub asset => never display a fictitious download.
Old VS Code => show declared 1.140.0 minimum, do not promise wider compatibility.
No API key => local actions work; coaching requires separately billed OpenAI API access.
No Graphify => setup explains exact virtual environment location; never invent graph data.
Example interaction => permanently labelled; no fabricated test execution or learning evidence.

## Execution

Sequential builder/reviewer/publisher passes in this side conversation. No sub-agents, account creation, analytics, form backend, custom-domain changes or automatic code repair. Public publication and hosting are explicitly authorized by the current request. Static hosting is reversible through Vercel deployment rollback. Plans use Superpowers principles; the user's autonomous execution request overrides repeated skill approval gates.
