# ChefShop design workspace

Design-only deliverables for the ChefShop culinary institute and store. No website implementation has started.

Visual direction: warm ivory, forest green, terracotta, editorial Georgia headings, and Arial UI text. All figures, identities, dates, products, and events are fictional examples; currency is EGP.

The design generator produces a screen specification, SVG previews, and a local Figma development plugin. The plugin creates native editable text, vector illustrations, layout frames, color variables, text styles, component instances, and prototype links. It has no network access and does not delete existing designs. Re-running it refuses to duplicate the finished design set.

## Generate

Run `node design/build-designs.cjs` from the project root.

## Figma import

In the Figma desktop editor: Main menu → Plugins → Development → Import plugin from manifest. Select `design/figma-plugin/manifest.json`, then run **ChefShop · Design Builder** in the supplied ChefShop file. This imports designs only; it does not publish a website or change sharing permissions.

## Review

Open `design/previews/index.html` to review the screens. `design/screens.json` is the exact design specification used by both the previews and the Figma builder.

The Figma prototype covers browsing → product → cart → checkout → confirmation; sign-in → student dashboard → module payment → receipt; and chef / management navigation. Form inputs are visual specifications, not a working payment or authentication system.
