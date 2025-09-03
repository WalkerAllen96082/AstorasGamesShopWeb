# TODO: Update HomePage Carousels

## Tasks
- [x] Create new UniversalCarousel component in src/components/UniversalCarousel.tsx
- [x] Update HomePage.tsx to fetch services and products data
- [x] Replace existing GameCarousel instances with three UniversalCarousel instances
- [x] Test responsive behavior on desktop and mobile
- [x] Verify arrow navigation and item display

## Details
- Remove two existing GameCarousel instances
- Add three new carousels: Most Viewed Games, Recently Added Services, Recently Added Products
- Desktop: 15 items in 3 groups of 5
- Mobile: 15 items in 5 groups of 3
- Arrows over first and last item
- Maintain card styles, adjust for mobile
