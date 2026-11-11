# ChefShop — expanded catalog and layered cuisine film

Target: existing ChefShop Figma file `MPTpr6xUM7RwoMHfkYh8OV`, Page 1 (`0:1`).

Delivered inventory: 12 meals (four Egyptian, four Italian, four Greek-menu dishes), 12 spices/herbs, and 12 cooking tools. Student uniforms, knife kits and fees remain accessible through the student portal. All 19 original mobile frame IDs and 402 × 874 viewports are preserved.

Six added meals: spanakopita, chicken gyro pita, halloumi vegetable pita, ful baladi, hawawshi, Alexandrian liver sandwich. New pantry items: thyme, rosemary, smoked paprika, cinnamon, sumac, Egyptian dukkah. New tools: chef knife, walnut cutting board, granite mortar and pestle, pizza cutter, colander, citrus press. Existing product photos were retained or cropped from the reference board to show the actual product rather than surrounding UI.

Each of the 36 catalog cards opens a distinct matching product detail. Meals link to suitable purchasable seasonings and tools; relevant seasoning/tool screens link back to meals. A native reusable product-card component has editable name, category and price properties. Final title slots use equal heights for consistent rows.

All twelve meals have six-state ingredient components with named matching layers, eased Smart Animate reveal/reassembly and a still-view alternative. The three-cuisine cinematic film contains independently animated ingredient layers, contact shadows, restrained glows, staggered labels and changing dish captions. Its 18.4-second native Motion timeline cycles through Alfredo, hawawshi and halloumi pita. A final crossfade returns to the opening dish. The phone hero has a shorter ingredient reveal fitting above its price and action.

This is layered 2D Figma motion using rendered bitmap ingredients; it does not implement deforming 3D food, fluid simulation, or a production browser animation engine. Existing cart/checkout remain illustrative prototype flows; catalog expansion is not a live commerce backend.

Review links:

- Motion film: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=60-10420
- Meals board: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=60-11241
- Tools board: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=60-11327
- Spices board: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=60-11413
- Mobile Home: https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=6-58

Validation: native plugin report confirmed 12 cards in each Shop category, 36 matching detail destinations, 12 ingredient families, 19 original viewports, and no collapsed text in revised product details. Visual review inspected all meal cards and the Italian, Egyptian and Greek exploded timeline phases. Playback was exercised in native Figma Motion. A final targeted pass aligns card titles and improves loop continuity.

Asset provenance and reproducibility: `assets.json` records all exact image prompts and copied output paths; `upload-receipt.json` records 25 committed asset hashes and source node IDs. Generated originals remain in their original locations. `build.js` expands the catalog, `motion.js` adds native animation and correct token bindings, `review.js` validates product destinations and creates review boards, `finish.js` applies final visual refinements. The installed development plugin reads `design/figma-plugin/code.js`.

The final phone-only correction is in `fix-mobile.js`: it authors geometry directly at phone dimensions before applying keyframes. Post-animation rescaling preserved Figma's older transform bases and caused oversized food; rebuilding at final dimensions corrected that issue. Both assembled and exploded phone phases were visually rechecked. Apply this correction after `finish.js` when reproducing the build. Replace its `__LAYER_HASH__` placeholder with the `alfredo-explode` hash from the receipt. The installed plugin is now the read-only `open-review.js` navigation helper.

Do not rerun the older v2/v3 builders: they target the earlier six-product catalog. The v4 builder depends on the retained source nodes, masters and existing mobile token collection. The YouTube page could not be fetched through the web tool, so no claim of frame-for-frame equivalence is made.
