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
