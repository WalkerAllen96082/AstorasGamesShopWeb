# TODO List for Game Cards and Carousels Update

## Games Page Changes
- [x] Reduce image size in ProductCard.tsx for default mode to make space for year, platform, price, and add to cart elements
- [x] Verify ProductCard is used with compact=false in GamesPage.tsx (already done)

## Home Page Changes
- [x] Update HomePage.tsx to fetch 15 games instead of 8 for each carousel
- [x] Modify GameCarousel.tsx to use larger cards (compact=false) and adjust grid sizes if needed
- [x] Ensure 15 games are displayed in 3 groups of 5

## Feedback Adjustments
- [x] HomePage: Make images larger, reduce space between cards, remove mini-description for more space
- [x] GamesPage: Remove mini-description to show elements
- [x] Both: Adjust cards symmetrically for aesthetics

## Testing
- [ ] Test Games page to confirm elements are visible and image is reduced
- [ ] Test Home page to confirm 15 games in 3 groups with larger cards
