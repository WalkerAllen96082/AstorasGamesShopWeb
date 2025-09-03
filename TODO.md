# TODO: Adjust Product/Service Preview Cards Layout

## Information Gathered
- The main component for preview cards is `src/components/ProductCard.tsx`, used across all pages (ServicesPage, ProductsPage, GamesPage, etc.).
- Current structure:
  - Card has `height: '100%'` and `flexDirection: 'column'`.
  - `CardMedia` for image with fixed height (180 or 280 based on compact).
  - `CardContent` with `flexGrow: 1` containing title, description, and bottom section.
  - Bottom section includes price, currency, and add-to-cart button.
  - For games, platform and year chips are shown above the description.
  - Description uses `WebkitLineClamp` (2 or 3 lines) to limit text.
- Issues:
  - Images have different dimensions, causing inconsistent card heights.
  - Description may be too short for services.
  - Bottom section (price, platform, year, button) needs to be consistently at the bottom.

## Plan
1. **Modify `src/components/ProductCard.tsx`**:
   - Set a fixed `minHeight` for the card to ensure consistent height across different image sizes.
   - Move platform and year chips for games to the bottom section alongside price and button.
   - Increase `WebkitLineClamp` for services to allow more description text (e.g., 4-5 lines).
   - Ensure the bottom section is pushed to the bottom using flexbox (`mt: 'auto'` or `justifyContent: 'space-between'`).
   - Adjust the description area to expand properly while keeping the bottom fixed.

## Dependent Files to Edit
- `src/components/ProductCard.tsx` (primary file to modify)

## Followup Steps
- [x] Test the changes on ServicesPage, ProductsPage, and GamesPage to ensure consistent layout.
- [x] Verify that cards maintain aesthetic consistency with different image dimensions.
- [x] Confirm that the bottom section is always aligned at the bottom of each card.
