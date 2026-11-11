# ChefShop: three kitchens and meal motion

The connected Figma file contains the finished revision:

- [Logo and six meal effects](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=23-652)
- [Interactive phone preview](https://www.figma.com/proto/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=23-1455&starting-point-node-id=23%3A1455&scaling=scale-down)

The editable vector emblem combines a plate with papyrus/water, a pasta fork, and an olive sprig. The master wordmark names Egypt, Italy, and Greece. It replaces the customer-facing header logo, including category and fulfillment states. Portal titles remain portal navigation.

All six meal detail pages contain native interactive component instances. Each has Assembled, Exploded and Still variants. Four separately clipped photographic layers move with Smart Animate. Explode takes 720 ms; reassemble takes 580 ms. Still view changes instantly. The original 19 phone frames retain their IDs and 402 × 874 dimensions.

In Figma Present mode, tap **See the ingredients**, then **Put it together**. **Still view** provides the same ingredient presentation without an animated transition. The collection board starts with all six demos expanded for comparison.

## Saved food assets and prompts

These project assets were generated with the built-in image-generation tool, with transparent backgrounds preserved:

- `alfredo-layers.png`
- `bolognese-layers.png`
- `pesto-layers.png`
- `pizza-layers.png`
- `souvlaki-layers.png`
- `taameya-layers.png`

The exact six final prompts and source/output paths are in `image-prompts.json`. The prompts request four isolated horizontal strata with a consistent elevated camera angle, warm editorial lighting and meal-specific ingredients. Figma clips each source into independent image layers. No raster image replaces the editable UI or vector logo.

`upload-receipt.json` records imported image hashes and source node IDs. `figma-brand-motion-report.json` records final component and variant IDs, structural checks and the live prototype review.

## Local tooling

The installed development plugin currently runs the idempotent `review.js`. `build.js` and `continue-builder.js` are implementation history, not scripts to rerun against the finished file. The revision is complete in Figma. Website animation code has not been implemented yet.
