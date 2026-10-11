# Vadhyar interface assets

- `vadhyar-logo.png`: the original transparent wordmark supplied by the user on 11 October 2026. Original dimensions and pixels preserved; rendered on a parchment plate. The sidecar records provenance, not a generation prompt.
- `fonts/`: Latin-subset WOFF2 files for Inter 400/500/600, JetBrains Mono 400/500 and Playfair Display 500/600 plus italic 400. Other scripts use the declared platform/Georgia fallbacks. Runtime uses only local bundled files.
- Font source: [Google Fonts CSS service](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap), downloaded during implementation. Preserve each bundled SIL Open Font License: [Inter](fonts/inter-OFL.txt), [JetBrains Mono](fonts/jetbrainsmono-OFL.txt), [Playfair Display](fonts/playfairdisplay-OFL.txt).

The build bundles CSS imports and emits referenced fonts and the logo into `dist`; the host permits only its local resource origin for images/fonts. There is no font CDN access at runtime.
