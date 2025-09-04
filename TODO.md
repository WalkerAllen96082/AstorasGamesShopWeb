# TODO: Implement Automatic Translation for Game Descriptions in Bulk Import

## Steps to Complete

- [x] Add translation utility function in BulkImport.tsx using LibreTranslate API
- [x] Modify processData function to detect language and translate English descriptions to Spanish
- [x] Update handleImport to handle async processData
- [x] Test bulk import with English descriptions to verify translation works
- [x] Handle translation errors gracefully (e.g., if API fails, keep original description)
- [x] Add loading indicator for translation process during import

## Notes
- Using LibreTranslate public API (https://translate.argosopentech.com/) for free translation
- Detect language using LibreTranslate detect endpoint
- Translate only if detected as English (en)
- Target language: Spanish (es)
- Translation errors return original text
- Existing loading indicator covers translation process
- Updated to MyMemory API due to LibreTranslate CORS issues
- Implemented aggressive rate limiting with exponential backoff (1s → 2s → 4s → 8s → 10s max)
- Added circuit breaker - skips translation after 5 consecutive failures
- Global state tracking prevents multiple simultaneous requests from overwhelming API
