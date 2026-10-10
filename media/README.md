# Vadhyar interface assets

- `vadhyar-logo.png`: original user-supplied transparent wordmark, 595×250; pixels preserved. Sidecar is supplied provenance.
- `brand/`, `guide/`, `path/`, `stickers/`, `gates/`: 26 SVGs hand-authored for design-v2.md §10 before the gallery. Abstract lotus and teaching hand; inert vector geometry, no baked text, scripts, embedded links or remote assets. Motion groups identify eyes, hand and petals where applicable. Artwork previews never imply earned stickers.
- `fonts/`: copied from the project's already-bundled Latin WOFF2 files; no font download in this slice. `inter-normal-600.woff2` is variable 100–900, `playfair-display-normal-600.woff2` 400–900 and `jetbrains-mono-normal-500.woff2` 400–800. Playfair italic 400 is the fourth referenced file. Variable ranges were checked from the bundled font tables.
- Preserve the SIL Open Font Licenses: [Inter](fonts/inter-OFL.txt), [JetBrains Mono](fonts/jetbrainsmono-OFL.txt), [Playfair Display](fonts/playfairdisplay-OFL.txt). Other scripts use platform fallbacks.

The gallery bundles font imports and copies artwork locally. Original extension resource policy is untouched in Phase 0; Phase 2 uses its local resource origin. No runtime font fetch or new external network call. Asset review: [Phase 0 report](../docs/design-v2/phase-0/README.md).

The existing v1 font files are also retained for its callers during panel integration.
