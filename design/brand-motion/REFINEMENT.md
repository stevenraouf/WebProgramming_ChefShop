# UI/UX Pro Max refinement

Applied the user-supplied `.claude/skills/ui-ux-pro-max/SKILL.md` to the existing ChefShop Figma design. Local searches covered restaurant typography, editorial/organic food styling, easing, reduced motion and restrained stagger. The initial generic system's pink enterprise palette was rejected as a poor fit; the approved cream, olive and terracotta identity remains authoritative.

The refinement improves readable text, spacing, header touch targets, form heights, ingredient labels and still-view controls. All 19 original 402 × 874 screens retain their IDs.

The six meal families now use Lift, Spread and Return intermediate states, in addition to Assembled, Exploded and Still. Different custom cubic curves control arrival, settling and departure. The overall reveal is about 0.9 seconds; the return is about 0.6 seconds. Still view bypasses motion.

Six additional **native Figma Motion studies** contain editable keyframes: each is 3.4 seconds with 24 tracks on ten animated layers. They add staggered translation/scale, a subtle photograph zoom, delayed label fades and reassembly. These can be opened in Motion mode and played from the timeline.

- [Interactive prototype](https://www.figma.com/proto/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=23-1455&starting-point-node-id=23%3A1455&scaling=scale-down)
- [Native Alfredo Motion timeline](https://www.figma.com/design/MPTpr6xUM7RwoMHfkYh8OV/ChefShop?node-id=38-2244&timeline=keyframe)

`refinement-report.json` records the final acceptance checks and all six native Motion frame IDs. `polish.js` contains the revision source; `finish-refinement.js` contains the final contrast repair and audit and is the currently installed local plugin entry point. `pre-refinement-review.js` retains the previous review script.

The website has not been implemented. OS-level reduced-motion detection, responsive breakpoints and browser animation performance remain implementation work; the Figma prototype provides an explicit instant still-view option.
