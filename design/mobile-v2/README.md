# ChefShop mobile design revision

The 19 original numbered frames were replaced in place in Figma file `MPTpr6xUM7RwoMHfkYh8OV`, Page 1. All are editable 402 × 874 iPhone 17 layouts. The original uploaded visual references remain on the page.

The revision uses native text, Auto Layout, token bindings, reusable components, cropped reference photographs, scrolling viewports, and prototype navigation. Additional category, meal, pickup, and overlay states support the 19 primary screens.

`figma-mobile-rebuild-report.json` records the final native layout audit: 19 scrollable frames, no reported layout problems, and a temporary 1200 px resize check with content capped at 1120 px. `figma-home-review.png` is the final native-app visual review. Figma was reloaded successfully and the sync warning cleared with the mobile frames retained.

`ChefShop-Mobile-v2.fig` is an editable backup saved before the final text-alignment polish. The connected Figma file contains the latest alignment update.

The local plugin currently runs the idempotent `final-qa.js`. The original rebuild source is `builder.js`; `repair.js` documents the text-sizing, horizontal-layout, and overlay corrections applied after that initial build. Do not rerun the rebuild source merely to inspect the finished file.

These are design and prototype screens. Checkout, quantity controls, filters, and payment fields still require website implementation.
