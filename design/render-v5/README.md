# ChefShop — lighting and rendered relief motion

Destination: existing Figma Design file `MPTpr6xUM7RwoMHfkYh8OV`, Page 1. The original 19 phone frame IDs, the 36-product catalog, and cross-selling links are retained.

The update includes:

- A quick outward burst, a long suspended drift, and a quick inward return. Native ingredient families use shorter eased transitions; rendered loops use matching speed changes.
- Studio lighting: ivory key, amber rim and olive fill, with perspective camera movement, physical mesh thickness and material shading.
- Food rendered from textured **3D relief meshes** derived from the existing ingredient images. These are real displaced/extruded meshes with camera movement, not reconstructed volumetric food scans. Their back surfaces are not intended for a full 360-degree inspection.
- A rendered loop and static alternative for each meal. Animated GIF playback is available in Figma Prototype/Present. Each meal component exposes Motion and Still variants.
- Native editable word-stagger headline entrances, shared fork and whole-wordmark motion, and restrained amber button glows. Hover and focus references are included in the interaction board; primary CTA clicks keep the Shop destination.

The restricted Uberdesigner library was omitted at the user's instruction. Only the publicly accessible landing-page content was read. No gated template was downloaded or copied. UI/UX Pro Max guidance informed minimum touch targets, restrained hover displacement and motion-free alternatives.

## Sources and reproduction

`render_relief.py` builds the Blender scenes. Geometry, UVs, material, studio lights, camera and 96-frame animation are saved in `renders/<meal>/<meal>-relief.blend`. Blender's Python module is installed only into the project-local `runtime` directory. Dependencies were downloaded from PyPI; no system installation is required. `wheels` retains the installation packages.

`encode.py <meal>` exports the rendered frames to an animated GIF and a matching still image. GIF timing averages roughly 24 fps, with a 4.08-second loop. `*-render-report.json` records the crop and timing. The crop is calculated from the rendered alpha bounds; UI is never flattened into the asset.

`upgrade.js` updates native easing, shadows, text motion and button variants. `identity.js` edits the shared identity source because Figma blocks animation writes inside instance sublayers. The wordmark uses a whole-layer entrance; headline words use native TextStagger. `button-fix.js` preserves click navigation without a competing mousedown variant change.

`prepare-import.cjs <meal> <meal>` prepares a small native-plugin asset batch from the encoded GIF/PNG files. `import-renders.js` imports these assets, creates two-state meal components, updates details and the main hero, and maintains review frames. Use small batches to avoid loading every base64 asset into the plugin at once. The imported GIF header is verified as GIF89a. The 3D asset replaces only the food illustration; all surrounding UI remains editable Figma layers.

The installed development plugin reads `design/figma-plugin/code.js`. Run the scripts in the order above; do not rerun the older six-item catalog builders.

## Playback and limitations

Use Figma's inline **Preview** or **Present** to watch rendered GIF motion and test hover. The Motion timeline previews native text/logo/easing; a static canvas screenshot alone does not demonstrate GIF playback. The Still control belongs to each meal's details component. Figma prototypes do not automatically implement a website's `prefers-reduced-motion` handling; that belongs in the eventual implementation.

This remains a design prototype. Existing illustrative checkout/cart flows are not a live commerce implementation. Full volumetric food models, fluid simulation and production WebGL code are separate work from the textured relief assets supplied here.

The desktop app reported unsynced changes while work was in progress. Keep the source scripts, rendered assets and any exported local Figma copy until account synchronization is confirmed.

The final native audit passed for all 12 Motion/Still component families, 19 original phone viewports and the primary Shop links. All 12 GIFs were independently checked at 4,080 milliseconds. They contain 84 encoded frames because identical hold frames were merged; the source Blender timelines contain all 96 rendered samples. All 12 Blender sources have their textures packed.

Review frames: [3D preview](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=72-4563), [12 meal studies](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=72-5300), [interaction states](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=72-3648).

A local `.fig` export was attempted through Figma's File menu, but no completed `.fig` file or save dialog was observed. `ChefShop-3D-design-source.zip` preserves the design scripts, rendered media and packed Blender models. It is a source archive, not a native Figma snapshot. Cloud synchronization was not confirmed. The installed plugin is now the friendly, read-only `open-review.js` navigation helper.
