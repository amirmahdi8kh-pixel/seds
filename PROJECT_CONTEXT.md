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