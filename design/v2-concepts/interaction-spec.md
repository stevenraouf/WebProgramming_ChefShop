# ChefShop · revised customer experience

These concepts follow the six reference images viewed on the user's ChefShop Figma canvas. Visual direction: warm cream, olive headings and accents, terracotta primary buttons, editorial serif headings, food and product photography. Branding remains ChefShop / Culinary Institute. Prices are illustrative EGP amounts, not final commercial pricing. No website implementation is included.

## Seven core pages

| Page | Required content | Click behavior |
|---|---|---|
| Home | Introduction, Kitchen Tools / Spices / Student Meals cards, featured meals, academy preview | Shop now opens Shop. Category cards preselect that Shop tab. View meal opens the selected meal. Explore the academy opens Academy. |
| Shop | The three category tabs, category-specific filters, product grid, search, sort, price, availability | Tabs, filters and sorting update this page. View details opens that exact product. Cuisine filters exist inside Student Meals, rather than replacing the three main shopping categories. |
| Product Details | Photo, name, price, relevant options, quantity, description and product-specific information | Option selection recalculates unit price. Quantity recalculates line total. Add to cart adds that SKU and selected options, then displays an added-to-cart confirmation with View cart and Continue shopping. Continue shopping restores the originating category and filters. |
| Cart | Mixed meal, spice and tool items; chosen variants; quantity controls; line totals; subtotal | Plus/minus updates totals within stock limits; Remove deletes the selected line. Continue shopping returns to the originating category. Proceed to checkout opens Checkout. An empty cart shows a clear Shop action and no active checkout action. |
| Checkout | Contact details, fulfillment choice, address for delivery, available date/time slots, compatible payment choices, item review and complete total | Pickup removes address fields and delivery fee, and shows collection information and pickup slots. Changing fulfillment clears incompatible slots/payment selections. Back to cart preserves edits. Place order validates contact, required address, available slot and stock, then submits once. Invalid fields or payment/order failure stay here and retain the cart. |
| Order Confirmation | Successful order reference, exact items/options/quantities, full total, payment status and fulfillment location/date/slot | Appears only after successful order creation. Continue shopping opens Shop; Back to home opens Home. Cash/pay-at-pickup shows amount due, not Paid. |
| Academy | Institute introduction, program overview, student kitchen process | Explore programs scrolls to the programs section. Shop student meals opens Shop with Student Meals selected. |

## Product Details has three templates, not three more top-level sections

- **Meal:** portion or size/variation, ingredients, allergens, fulfillment availability and storage/reheating information when relevant. Main action: Add meal to cart.
- **Spice:** pack weight, ingredients, storage and relevant product details. Main action: Add spice to cart.
- **Kitchen tool:** size/capacity if applicable, material, dimensions/capacity and care information. Main action: Add tool to cart.

## Meal → ingredient/tool discovery

List the meal's complete ingredient information. Fresh ingredients the store does not sell remain plain text. Below it, an optional **Recreate it at home** section contains only relevant available products with a photo, name, price, and View spice / View tool link. The primary meal purchase must remain visually dominant.

The linked spice/tool page includes a contextual **Back to [meal]** link. Return navigation preserves meal portion, variation, quantity and originating Shop filters. A spice can show **Cook with this spice**; a tool can show **Used for this meal**, both linking back to relevant meal details. These are optional independent purchases, never compulsory bundles.

| Meal | Example shoppable spice | Example shoppable tool |
|---|---|---|
| Pasta Alfredo | Black pepper | Saucepan, pasta tongs |
| Pasta Bolognese | Dried oregano, black pepper | Sauté pan, wooden spoon |
| Pesto Pasta | Black pepper | Food processor, pasta tongs |
| Margherita / Mushroom / Pepperoni / Vegetable Pizza | Dried oregano, optional chili flakes where used | Pizza stone, pizza cutter |
| Chicken Souvlaki Pita | Dried oregano, black pepper | Grill pan |
| Spanakopita | Black pepper, dried dill if the actual recipe uses it | Baking tray |
| Taameya Sandwich | Ground cumin, ground coriander | Frying pan |
| Ful Sandwich | Ground cumin | Saucepan |

Links must be backed by the institute's actual recipes and actual catalog. Final ingredient and allergen declarations must match the recipe used, including optional toppings or variations.

## Menu direction

- **Italian:** Pasta Alfredo, Pasta Bolognese, Pesto Pasta; pizza with Margherita, mushroom, pepperoni and vegetable variations.
- **Greek:** Chicken Souvlaki Pita, a Greek chicken bowl or wrap, Spanakopita.
- **Egyptian on the go:** Taameya in baladi bread, Ful Sandwich, and an optional grilled kofta wrap.

The Egyptian taameya concept uses fava beans. Product photos should show each actual dish; a Ful Sandwich needs a fava-bean filling, not a taameya/falafel photo.

## Demonstration price and state rules

- Alfredo Regular EGP 160 / Large EGP 200. The order example uses Regular × 1.
- Black Pepper 50 g EGP 40 / 100 g EGP 70. The order example uses 50 g × 1.
- Saucepan 2 L EGP 450 × 1.
- Shared subtotal = **EGP 650**. Delivery example adds EGP 30, total **EGP 680**. Campus pickup adds zero, total **EGP 650**.
- Pizza size example: Small EGP 150 / Medium EGP 190 / Large EGP 230. Variation-specific additions should update the displayed price before adding to cart.
- Order success example uses campus pickup and pay at pickup: **EGP 650 due**, not a paid receipt.
- Product counts, availability and filters in the eventual app must be derived from the same catalog data.

## Image concepts versus functional specification

The generated boards are visual concepts. This document and the workflow image define precise interactions and state rules. Image-generated microcopy, small labels, counts and product photography require a final editorial pass when building the editable screens. The previous 19-screen design package remains intact; this revision focuses on the seven customer-facing pages requested.
