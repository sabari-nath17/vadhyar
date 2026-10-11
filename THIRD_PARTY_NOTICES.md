# Third-party notices

The local Vadhyar prototype declares `UNLICENSED`; this is not an open-source license grant. No Marketplace publication is part of this build.

| Shipped material | Version / source | Notice |
| --- | --- | --- |
| OpenAI official SDK | 7.32.0, bundled extension code | [Apache-2.0 text](docs/third-party/openai-LICENSE.txt) |
| React | 19.3.0, bundled panel | [MIT text](docs/third-party/react-LICENSE.txt) |
| React DOM | 19.3.0, bundled panel | [MIT text](docs/third-party/react-dom-LICENSE.txt) |
| Zod | 4.6.5, bundled validators | [MIT text](docs/third-party/zod-LICENSE.txt) |
| CodeTour schema/convention | Pinned source in [reuse provenance](docs/selective-reuse.md) | [MIT text](docs/third-party/codetour-LICENSE.txt) |
| OpenSpec Markdown convention | Pinned source in [reuse provenance](docs/selective-reuse.md) | [MIT text](docs/third-party/openspec-LICENSE.txt) |
| Inter, JetBrains Mono, Playfair Display | Eight local Latin WOFF2 faces | [Inter OFL](media/fonts/inter-OFL.txt), [JetBrains Mono OFL](media/fonts/jetbrainsmono-OFL.txt), [Playfair Display OFL](media/fonts/playfairdisplay-OFL.txt) |
| Vitest and its Vite/native runtime dependencies | Exact production tree in `package-lock.json` | Original license files remain alongside their packages in `node_modules` |

Graphify is a separately installed Python prerequisite, not redistributed inside the VSIX. Promptfoo, VSCE, TypeScript and ESLint are development tools, excluded from the VSIX. Esbuild is both the development bundler and a dependency of the packaged test runtime. Original font and wordmark provenance remains in [media/README.md](media/README.md).

## Runtime notice coverage

All original production-package license files remain in the VSIX, including the complete Vite/Vitest combined notices, Rolldown `THIRD-PARTY-LICENSE`, tslib copyright text and std-env `LICENCE`. React's bundled scheduler 0.28.0 uses its [original MIT notice](docs/third-party/scheduler-LICENSE.txt).

The native `@esbuild/darwin-arm64` 0.28.2 distribution shares [esbuild's MIT text](docs/third-party/esbuild-LICENSE.txt). The native `@rolldown/binding-darwin-arm64` 1.2.13 shares [Rolldown's MIT text](docs/third-party/rolldown-LICENSE.txt) and [combined third-party notices](docs/third-party/rolldown-THIRD-PARTY-LICENSE.txt). These distributions omit a separate license file; the version-matched parent texts are retained here.

`@aws-sdk/credential-provider-http` 3.972.75, `@aws-sdk/credential-provider-login` 3.972.80 and `@aws-sdk/nested-clients` 3.997.47 declare Apache-2.0 but omit license texts from their npm distributions. The [full Apache-2.0 text from the same AWS SDK project](docs/third-party/aws-sdk-Apache-2.0.txt) is included alongside their exact package metadata and [upstream source repository](https://github.com/aws/aws-sdk-js-v3). No absent package-specific copyright statement is invented.

Lightning CSS and its darwin-arm64 executable 1.33.0 are unmodified MPL-2.0 covered software. Their [full license](docs/third-party/lightningcss-LICENSE.txt) is retained. Matching source is available at [upstream v1.33.0](https://github.com/parcel-bundler/lightningcss/tree/v1.33.0), commit `c6a0c3cebf3395635e61075d2c81a96a710d4910`, or [that exact source archive](https://github.com/parcel-bundler/lightningcss/archive/c6a0c3cebf3395635e61075d2c81a96a710d4910.tar.gz). Recipients may obtain and modify that covered source under MPL-2.0; Vadhyar's separate project status does not restrict those rights. The tag/commit route was verified for this release. Native binaries retain upstream notices; a source rebuild of every compiled constituent is not claimed.
