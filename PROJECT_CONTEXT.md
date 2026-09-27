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