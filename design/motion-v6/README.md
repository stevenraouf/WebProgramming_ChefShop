# ChefShop motion v6

Figma file: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop

Review targets:

- Interactive phone preview: `115:2129`, 402 × 874. The superseded `94:2111` preview is retained as a hidden archive.
- Native meal-animation review: `92:5819`.
- Start here board: `92:5853`.
- Native editable backup: `ChefShop-v6-2026-11-08.fig` (340,326,836 bytes), saved before the final preview replacement. The replacement's complete source is in `figma-preview/`.

The 19 original phone screens and the catalog of 12 meals, 12 spices and 12 tools are preserved. All 12 existing meal-motion families received new 720 × 900 GIFs and finished-meal still views. The 960 × 1200 MP4 masters and assembly/expanded checks are in `renders/`. Each 5.6-second loop has a quick reveal, suspended drift and quick return. Its finished endpoint matches its opening frame.

`interactive/` contains the responsive preview source: local Three.js, fonts, meal photographs, mesh geometry, controls, filters and reduced-motion handling. `figma-preview/` is the validated import version, with all 169 files at its root to avoid the importer's Windows directory-path issue. Its geometry is transported as base64 gzip text because the Figma preview proxy did not serve the original `.gz` requests reliably. The original compressed meshes remain in `interactive/assets/` as source files.

Verified in the Figma UI: native animation and its Still view; interactive pause, Taameya reassembly, the Greece filter, Souvlaki selection, and the 402 × 874 frame. The cloud workspace validation decoded and checked all 133 geometry payloads across the 12 meals. `validate-source.cjs` checks the local manifest, endpoints, spacing and complete fragment coverage.

These are photo-derived 3D relief surfaces with limited perspective, not volumetric food scans or Unreal Engine renders. The canonical finished photographs prevent the old flattened closing stack.

The first import's per-session workspace was repaired, but its original seed still failed in a separate session. The final replacement imports the corrected flat project as a new source seed; its cached preview was observed rendering and looping in Figma. The old project is archived, not deleted. No production website was published.

Third-party licenses are included in `interactive/vendor/LICENSE` and `interactive/assets/fonts/`.
