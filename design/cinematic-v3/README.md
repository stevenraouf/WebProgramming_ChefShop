# ChefShop cinematic redesign

The connected Figma file contains the revised dark visual identity and landing pages:

- [Phone Home](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=6-58)
- [Desktop landing page](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=54-3652)
- [New identity board](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=54-3718)
- [Desktop Motion timeline](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=54-3652&timeline=keyframe)

The user's video reference was viewed in YouTube: `https://youtube.com/shorts/0XhsZYTDopo`, titled *Restaurant Website Design 2026 | Premium Food Business Website*. The adopted direction is its dark culinary atmosphere, warm lighting, condensed typography and food-led composition. ChefShop has its own layout, assets and identity.

## Identity and visual system

The original 19 phone frames retain their IDs and 402 × 874 dimensions. Their editable text uses **Bebas Neue** and **Manrope**. Semantic color variables now use charcoal green, warm ivory, ember orange and restrained sage accents. Uploaded reference boards remain available.

The newly drawn vector fork replaces the former plate emblem through the existing master component. Its central crown suggests papyrus, outer tines suggest olive leaves, and curled handle suggests pasta. The three tines and explicit Egypt · Italy · Greece tagline connect the three cuisines.

The mobile Home was recomposed with a hero, three cuisine cards, six student-meal cards and Academy preview. The new desktop Home is 1440 × 2002 and uses the same direction. Both are editable native Figma layouts.

## Motion

Phone and desktop Home each have six-second native Figma timelines. They use 20 keyframe tracks across the two layouts: a subtle floating food translation, scale, rotation and opacity; an ember-light change; and staged text/content arrivals. Open Motion mode and press Play. The previous six ingredient-reveal families remain in the file and inherit the dark visual system.

These are rendered food imagery and layered native Figma animations. Interactive 3D meshes, real-time lighting, browser performance, and scroll-linked production motion remain website implementation work.

## Saved assets and validation

- `alfredo-hero.png`: the generated transparent food render, created using the **built-in image-generation tool**.
- `hero-prompt.json`: the exact final prompt and generation mode.
- `upload-receipt.json`: imported image hash and source node ID.
- `desktop-review.png`: the desktop export reviewed before the final overflow crop and footer-spacing adjustment.
- `figma-report.json`: final dimensions, key Figma IDs, fonts, motion and verification evidence.

`build.js` is the source of this revision. It should not be rerun against the finished design. The installed local plugin currently runs the idempotent `review.js`, which audits the revision and navigates to the phone, desktop and identity frames.
