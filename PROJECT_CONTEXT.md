Open admin/editor.html and fix the Visual Editor preview manually.

Current problem:
The iframe still shows the placeholder/live preview area and does not load the real website.

Do not search and replace strings.
Read the file structure first.

Make these changes:
1. Find the iframe inside admin/editor.html.
2. Change only its src to:
https://seds.amirmahdi-8kh.workers.dev

3. Keep all existing Visual Editor features:
- Edit Mode button
- element selection
- editing panel
- text/image/background/link editing

4. Do not modify the public website.
5. Run node tools/build.js after finishing.

=== Latest Project History ===

- iframe real website loading was fixed: Changed iframe src to https://seds.amirmahdi-8kh.workers.dev
- Public website must remain unchanged - only the admin/editor.html iframe src was modified
- Current Visual Editor works but is only a basic editor with existing features (Edit Mode, element selection, text/image/background/link editing)
- Current problems:
  - Toolbar UI is not professional
  - No real CMS workflow
  - Cannot add/remove pages
  - Cannot add/remove sections
  - No proper save/publish system
- Previous rebuild attempt was stopped and admin/editor.html was restored
- Current state is stable

=== Phase 1 Complete (2026-09-26) ===
- Created admin/editor-state.js — stable editor state system with data-editor-id management and localStorage persistence
- Created admin/dom-manager.js — DOM detection and element ID assignment; findElementById, highlightElement, initializeIdMap functions
- Ran node tools/build.js — build succeeded, all portfolio pages generated

=== Phase 2 Complete (2026-09-26) ===
- Connected dom-manager.js and editor-state.js with admin/editor.html
- Clicking existing website elements inside iframe selects them (via setupElementSelection using EditorState.selectElement)
- Inspector shows real element data: tag name, text content, image source, link URL, computed styles (font size, color, alignment)
- Existing website design completely untouched — all modifications work through the iframe DOM
- No save/publish system implemented yet ( Phase 3+)
- Did not modify public website files, assets/js/main.js, or tools/build.js
- Build verified: node tools/build.js succeeds with no errors

=== Phase 3 Complete (2026-09-27) ===
- Implemented content editing on top of existing Visual Editor architecture
- Text editing: select text elements, edit content/family/size/weight/color/alignment — apply live to iframe DOM, save to localStorage
- Image editing: select images, change source URL, update alt text, save to state
- Link editing: edit link text, href, target (_self/_blank), save to state
- Style editing foundation: background color, padding, margin for container/section elements — apply live, save to state
- Revision tracking: every change increments revision; modifications stored in localStorage modificationHistory (last 50 changes)
- recordModification(), saveDraftChange(), undoLastModification() APIs added to editor-state.js
- Inspector change handlers attached in editor.html — changes apply live to iframe DOM and persist to localStorage
- Existing website design completely untouched — all modifications work through the iframe DOM
- Did not modify public website files, assets/js/main.js, or tools/build.js
- Build verified: node tools/build.js succeeds with no errors

=== Phase 3 Completed Status ===
- Phase 3 content editing integration completed
- Modified files:
  - admin/editor.html — added script imports for editor-state.js and dom-manager.js; integrated EditorState and DomManager into element selection, inspector, and toggle flow; attached inspector change handlers for text, image, link and style editing
  - admin/editor-state.js — added recordModification(), saveDraftChange(), and undoLastModification() APIs; revision tracking with modificationHistory array (last 50 changes); localStorage draft persistence via pe-editor-state-v1
  - admin/dom-manager.js — provides findElementById, initializeIdMap, highlightElement/unhighlightElement for stable DOM referencing and element highlighting
- Implemented text editing: content, font family, font size, font weight, color, text alignment — live application to iframe DOM and state saving
- Implemented image editing: source URL and alt text changes — live application and state saving
- Implemented link editing: text, href, target (_self/_blank) changes — live application and state saving
- Implemented style editing foundation: background color, padding, margin for container/section elements — live application and state saving
- Revision tracking and localStorage draft saving: every change increments revision counter; modifications stored in localStorage modificationHistory array (retains last 50 changes); draft can be saved and tracked across editor sessions
- Public website files unchanged: all modifications work through the iframe DOM; portfolio source files, assets, and site.config.js remain untouched