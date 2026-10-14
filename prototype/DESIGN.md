# Vadhyar prototype design

## Direction and references

Keep the existing original wordmark, warm parchment, muted olive controls, serif content headings and restrained monospace source. This refinement makes a real local project the default and moves the prepared NovaDesk lesson to an optional example. Source, requirement, case and evidence remain together; no inferred mastery or invented repository graph.

Inspected on 14 October 2026 using live browser screenshots and primary documentation:

- [shadcn sidebar-11 file explorer](https://ui.shadcn.com/view/new-york-v4/sidebar-11): adapt separate navigation and source surfaces, selected-file contrast and path context. Its generic placeholder content and dark palette are intentionally not adopted.
- [Component Gallery tree-view examples and guidance](https://component.gallery/components/tree-view/): adapt filter/search, clear selection and ample touch areas. This slice exposes a paginated flat file list, so use native list/button semantics rather than misleading tree roles or an incomplete tree keyboard model.
- [shadcn sidebar anatomy](https://ui.shadcn.com/docs/components/base/sidebar): reuse the idea of stable project context and separate desktop/mobile navigation behavior. Existing house controls and dependencies remain in use; no third-party component code copied.

## Tokens and layout

Existing prototype tokens: parchment #faf8f3, olive #4b593f, muted gold #866238, dark ink. Inter interface/body, Playfair Display headings, JetBrains Mono source. Reuse the current 8/16/24/32 spacing rhythm, generous desktop margins and existing six-destination shell. Source explorer is a narrow file list plus flexible selected-source panel; text wraps around long project names and paths, code scrolls inside its panel. At narrow widths the file list precedes the source and the existing compact navigation remains usable. No whole-repository tree rendering.

## Components and states

Today offers one main action: choose source for a question. Project/Learn exposes explicit search, bounded result pages, indexing status, selected source range and a confirmed requirement/case. Lesson states preserve prediction, self-reported observation, source refresh, scoped script/manual evidence, human verdict, reflection and a separate learner-defined case. Project name, paths, source, requirement and records are data. The optional prepared example retains a visible label and separate saved data.

Show loading, empty search, source not readable, API error, partial index and unavailable script states. Do not replace error evidence with a success illustration. Storage corruption stays recoverable; unsaved work has export/retry and navigation protection. Script consent displays the exact command and source/manifest identities. Exit status and requirement verdict are separate.

## Accessibility and motion

Native labels, form controls, button semantics, dialogs with Escape, heading focus, skip link and visible keyboard focus. Aim for at least 44px actionable rows/controls, 12px minimum mobile support copy and readable source; selected states use text and shape as well as color. Keep current subtle hover/focus transitions only; no decorative entrance/scroll animation. Existing prefers-reduced-motion disables transitions. Live motion references were not inspected because no new animation is being introduced.

## Verification

Compare existing concept and final rendered desktop/mobile views for brand, typography, spacing, selected-state clarity and source containment. Test current real-project flow plus separate non-NovaDesk fixtures, source changes, failure/timeout evidence, malformed storage, keyboard and touch-sized narrow layout. Synthetic scale measurements bound claims; no unlimited-size guarantee.
