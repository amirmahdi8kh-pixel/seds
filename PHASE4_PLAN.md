# Phase 4 — Professional Visual CMS Builder

## Overview
Build a professional Visual CMS Builder at Webflow/Framer level capability, transforming the Visual Editor into a complete design platform while preserving the existing iframe-based architecture and Phase 1-3 compatibility.

## Current State Analysis

### Existing Architecture (Phases 1-3)
- **iframe-based**: Editor operates inside an iframe pointing to the website
- **data-editor-id**: Each editable element gets a stable `data-editor-id` attribute
- **EditorState**: Central state manager with `isEditMode`, `selectedElement`, `currentPage`, `revision`, `elementIdCounter`, `idMap`
- **DomManager**: DOM utilities: `findElementById`, `findElementBySelector`, `initializeIdMap`, `highlightElement/unhighlightElement`
- **localStorage**: Persists `pe-editor-state-v1` with edit mode, selected element ID, current page, revision counter, element ID counter
- **Phase 3 additions**: Text/image/link/style editing, revision tracking with `modificationHistory` (last 50 changes), `recordModification()`, `saveDraftChange()`, `undoLastModification()`

### Key Files (Unchanged)
- `admin/editor.html` — UI with toolbar, iframe, inspector panel, element selection logic
- `admin/editor-state.js` — State manager, localStorage persistence, event dispatching
- `admin/dom-manager.js` — DOM element finding, ID management, highlighting
- `assets/js/main.js` — Public website (DO NOT MODIFY)
- Iframe loads: `https://seds.amirmahdi-8kh.workers.dev`

---

## 1. Advanced Page Management

### Features
- Multiple page management within a project
- Page settings dialog (name, slug, status)
- SEO metadata: title, description, Open Graph tags
- Draft/Published status tracking
- Duplicate page functionality
- Version restore/ history per page
- Page reordering in navigation

### Data Model
```json
{
  "pages": {
    "index.html": {
      "id": "page-1",
      "name": "Home",
      "slug": "/",
      "status": "published", // "draft" | "published" | "archived"
      "seo": {
        "title": "Home - Nima Vale Portfolio",
        "description": "Portfolio of Nima Vale",
        "ogTitle": "Nima Vale Portfolio",
        "ogDescription": "Creative portfolio website",
        "ogImage": "/assets/og-image.jpg"
      },
      "sections": [...],
      "version": 4,
      "versionHistory": [
        {
          "version": 4,
          "timestamp": "2026-09-27T10:30:00Z",
          "changes": "Added hero section",
          "author": "admin"
        }
      ]
    }
  }
}
```

### New API Methods (page-manager.js)
- `PageManager.createPage(pageData)` — Create new page with default structure
- `PageManager.deletePage(pageId)` — Move page to trash, preserve version
- `PageManager.duplicatePage(pageId)` — Clone page with incremented version
- `PageManager.restoreVersion(pageId, versionNum)` — Restore page to previous version
- `PageManager.setPageStatus(pageId, status)` — Set draft/published/unpublished
- `PageManager.updateSEO(pageId, seoData)` — Update SEO metadata
- `PageManager.getCurrentPage()` — Get current active page data

---

## 2. Professional Section Builder

### Features
- Section templates library (hero, features, about, services, contact, etc.)
- Reusable sections (global sections with instances across pages)
- Section settings panel with layout, background, spacing controls
- Responsive layout controls per breakpoint
- Column structures (1-12 column grid)
- Spacing controls (padding, margin all sides)
- Background controls (color, image, gradient, video, overlay)

### Section Data Model
```json
{
  "sections": {
    "section-1": {
      "id": "section-1",
      "type": "hero", // hero, features, about, service, contact, etc.
      "name": "Hero Section",
      "layout": {
        "grid": "12-col",
        "columns": 1,
        "gap": "1rem",
        "direction": "column", // column | row
        "align": "start|center|end|stretch",
        "justify": "start|center|end|between|around"
      },
      "background": {
        "type": "color|image|gradient|video|pattern",
        "color": "#ffffff",
        "image": "/images/hero-bg.jpg",
        "imageFit": "cover|contain|fill|none",
        "imagePosition": "left|center|right",
        "gradient": "linear|radial",
        "gradientColors": ["#ff0000", "#0000ff"],
        "gradientDirection": "to bottom|to top|...",
        "overlay": {
          "enabled": true,
          "color": "rgba(0,0,0,0.5)",
          "type": "solid|gradient"
        }
      },
      "spacing": {
        "padding": "4rem 2rem",
        "margin": "0 auto"
      },
      "elements": [...]
    }
  }
}
```

### Template Library
Pre-built sections that can be dropped into pages:
- Hero templates (with different headline styles, CTA patterns)
- Feature grids
- About us patterns
- Service cards
- Testimonial sections
- Contact forms

### New API Methods (page-manager.js)
- `PageManager.addSectionFromTemplate(templateId, position)` — Insert template section
- `PageManager.makeSectionReusable(sectionId)` — Convert to global section
- `PageManager.updateSectionLayout(sectionId, layoutData)` — Update responsive layout
- `PageManager.setSectionBackground(sectionId, backgroundData)` — Update background

---

## 3. Component System

### Built-in Components
- **Text**: Paragraph, heading elements with full typography controls
- **Heading**: H1-H6 with responsive typography
- **Image**: With alt text, lightbox, picture source sets, and Media Library browser
- **Video**: Embed support (YouTube, Vimeo, self-hosted), poster frames, full player controls, responsive behavior, lazy loading
- **Button**: Multiple styles, states (default, primary, secondary, disabled), hover effects
- **Cards**: Image + text cards, pricing cards, feature cards with hover states
- **Gallery**: Masonry, grid, carousel gallery layouts
- **Custom Components**: User-defined component libraries

### Component Data Model
```json
{
  "components": {
    "component-h1-1": {
      "id": "component-h1-1",
      "type": "heading",
      "tag": "h1",
      "content": "Our Services",
      "styles": { ... },
      "mediaId": null,  // references Media Library asset ID if this component has associated media
      "settings": {
        "headingLevel": "h1",
        "align": "center",
        "link": null,
        "target": "_self"
      }
    },
    "component-video-1": {
      "id": "component-video-1",
      "type": "video",
      "tag": "video",
      "mediaId": "vid-hero-background",  // references Media Library asset
      "sourceType": "local|youtube|vimeo|url",  // video source type
      "source": {
        "local": "/videos/hero.mp4",  // for local videos
        "youtube": "dQw4w9WgXcQ",  // YouTube video ID
        "vimeo": "123456789",  // Vimeo video ID
        "url": "https://example.com/video.mp4"  // self-hosted URL
      },
      "poster": "/posters/hero-poster.jpg",  // poster image before playback
      "playerConfig": {
        "autoplay": false,
        "loop": false,
        "muted": true,
        "controls": true,
        "playsinline": true,
        "aspectRatio": "16:9"
      },
      "settings": {
        "preload": "auto|metadata|none",
        "fit": "contain|cover",  // how video fits within component
        "loop": true,
        "muted": true
      }
    },
    "component-image-1": {
      "id": "component-image-1",
      "type": "image",
      "tag": "img",
      "mediaId": "img-hero-bg",
      "srcSet": {
        "desktop": "/images/hero-desktop.jpg",
        "tablet": "/images/hero-tablet.jpg",
        "mobile": "/images/hero-mobile.jpg"
      },
      "sizes": "(max-width: 1200px) 100vw, (max-width: 768px) 50vw, 33vw",
      "settings": {
        "align": "center",
        "borderRadius": "md",
        "opacity": 1
      }
    }
  }
}
```

### New API Methods (extended)
- `PageManager.addComponent(componentType, options)` — Add component to selected section
  - `componentType`: "heading"|"image"|"video"|"button"|"cards"|"gallery"|"custom"
  - For video components: includes `mediaId`, `sourceType`, `playerConfig`, `poster`
- `PageManager.replaceComponent(componentId, newType)` — Swap component type
  - Preserves Media Library references when type-compatible
- `PageManager.deleteComponent(componentId)` — Remove component
  - Offers to add to Media Library unused status
- `PageManager.duplicateComponent(componentId)` — Clone component
  - Duplicates Media Library asset reference (shallow copy)
- `ComponentSystem.selectMedia(assetId)` — Open Media Library browser from component
- `ComponentSystem.updatePlayerConfig(componentId, config)` — Update video player settings
- `ComponentSystem.swapMedia(componentId, newMediaId)` — Replace media asset on component

---

## 4. Advanced Style Engine

### Typography Controls
- Font family (Google Fonts integration, system fonts)
- Font size (responsive: clamp(), fixed units)
- Font weight (100-900)
- Line height
- Letter tracking
- Text transform
- Text color (color picker, design tokens)
- Drop shadow on text

### Spacing Controls
- Padding (all sides, individual sides, responsive)
- Margin (all sides, individual sides, responsive)
- Space between (grid/gap)

### Layout Controls
- Width (fixed, percentage, max-width)
- Display (block, inline-block, inline, flex, grid)
- Flex properties (direction, wrap, align, justify)
- Grid properties (columns, rows, gap, auto-flow)
- Position (static, relative, absolute, fixed)
- Top/Right/Bottom/Left (positioning)

### Borders & Shadows
- Border width (all sides, individual sides, radius)
- Border color
- Box shadow (horizontal, vertical, blur, spread, color)
- Text shadow

### Backgrounds
- Solid color
- Gradient (linear, radial)
- Image (repeat, position, size, attachment)
- Video background
- CSS var integration

### New API Methods (style-engine.js - new file)
- `StyleEngine.applyTypography(element, typographyData)` — Apply font styles
- `StyleEngine.applySpacing(element, spacingData)` — Apply padding/margin
- `StyleEngine.applyLayout(element, layoutData)` — Apply display/flex/grid
- `StyleEngine.applyBorders(element, borderData)` — Apply border styles
- `StyleEngine.applyShadows(element, shadowData)` — Apply box/text shadow
- `StyleEngine.applyBackground(element, backgroundData)` — Apply background styles
- `StyleEngine.generateDesignToken(tokenName)` — Generate/retrieve design token

---

## 5. Responsive Builder

### Breakpoint System
- **Desktop**: 1440px default, custom widths
- **Tablet**: 768px, custom widths
- **Mobile**: 375px, custom widths

### Responsive Behavior
- Inherit from larger breakpoint
- Override specific properties per breakpoint
- Responsive visibility (show/hide per breakpoint)
- Responsive units (clamp(), percentages, viewport units)

### Data Model Extension
```json
{
  "responsive": {
    "breakpoints": {
      "desktop": {"width": "1440px"},
      "tablet": {"width": "768px"},
      "mobile": {"width": "375px"}
    },
    "currentBreakpoint": "desktop",
    "overrides": {
      "fontSize": {
        "desktop": "1.25rem",
        "tablet": "1rem",
        "mobile": "0.875rem"
      }
    }
  }
}
```

### New API Methods
- `ResponsiveManager.setCurrentBreakpoint(breakpoint)` — Switch viewport mode
- `ResponsiveManager.isResponsiveProperty(property, breakpoint)` — Check if property has override
- `ResponsiveManager.getOverride(property, breakpoint)` — Get value at specific breakpoint
- `ResponsiveManager.applyResponsiveStyles(element)` — Apply all breakpoint styles

---

## 6. Animation System

### Entrance Animations
- On page load animations
- Pre-built animations: fade, slide, zoom, flip
- Animation duration, delay, easing curves
- Animation start conditions (viewport enter, mouse hover, page load)

### Hover Animations
- Scale, rotate, translate transitions
- Color transitions on hover
- Shadow intensification
- Border color changes

### Scroll Animations
- Scroll trigger animations
- Progress-based animation (progress bar, reveal on scroll)
- Parallax effects
- Sticky positioning animations

### Data Model
```json
{
  "animations": {
    "element-animations": {
      "section-1": {
        "id": "section-1",
        "enter": {"type": "fade", "duration": "500ms", "delay": "0ms", "easing": "ease-out"},
        "hover": {"type": "scale", "scale": "1.05", "duration": "300ms", "easing": "ease-out"},
        "scroll": {"type": "reveal", "distance": "50px", "duration": "800ms", "easing": "ease-out"}
      }
    }
  }
}
```

### New API Methods (animation-system.js - new file)
- `AnimationEngine.playEntranceAnimation(element, config)` — Play entrance animation
- `AnimationEngine.playHoverAnimation(element, config)` — Set up hover animation
- `AnimationEngine.playScrollAnimation(element, config)` — Set up scroll-triggered animation
- `AnimationEngine.stopAllAnimations(element)` — Remove animations from element

---

## 7. Layers Panel

### Hierarchy Tree
- Drag-and-drop reordering of all elements
- Collapsible/expandable section hierarchy
- Search/filter through layered elements
- Focus highlight on selection

### Layer Actions
- **Select**: Click layer to select corresponding element in iframe
- **Lock**: Lock layer to prevent selection/editing
- **Hide**: Hide layer from preview (retains in structure)
- **Duplicate**: Copy layer with all styles/settings
- **Group**: Group multiple layers into a folder

### Data Model
```json
{
  "layers": {
    "tree": [
      {"id": "body", "tag": "body", "parent": null, "locked": false, "hidden": false},
      {"id": "header", "tag": "header", "parent": "body", "locked": false, "hidden": false},
      {"id": "section-1", "tag": "section", "parent": "header", "locked": false, "hidden": false},
      {"id": "h1-1", "tag": "h1", "parent": "section-1", "locked": false, "hidden": false},
      {"id": "p-1", "tag": "p", "parent": "section-1", "locked": false, "hidden": false}
    ]
  }
}
```

### New API Methods (layers-panel.js - new file)
- `Layers.selectLayer(layerId)` — Select element in iframe corresponding to layer
- `Layers.lockLayer(layerId)` — Lock/unlock layer
- `Layers.hideLayer(layerId)` — Show/hide layer in editor
- `Layers.reorderLayer(layerId, direction)` — Move layer up/down in hierarchy
- `Layers.searchLayers(query)` — Search through layer hierarchy

---

## 8. Media Library

The Media Library is a unified system for managing all visual and auditory assets in the Visual CMS Builder. It replaces the previous Asset Manager with a more comprehensive system that supports the full media workflow from upload through to implementation.

### Media Types
- **Images**: Raster (JPEG, PNG, WebP, GIF) and Vector (SVG)
- **Videos**: Local (MP4, WebM, OGG), External (YouTube, Vimeo), and Future Audio (MP3, WAV, M4A)
- **Icons**: SVG icons and icon fonts
- **Fonts**: System fonts, Google Fonts, and custom WOFF2/OTF collections

### Video Support (Comprehensive)
Videos are a first-class media type in the CMS Builder with support for:

**Local Video**
- Upload from computer or drag-and-drop
- Support for MP4, WebM, OGG formats
- File size limits and progress tracking
- Video duration and dimensions metadata

**External Video Sources**
- YouTube video embed with video ID
- Vimeo video embed with video ID
- URL-based video sources for self-hosted players

**Video Player Controls**
- `autoplay`: Automatic playback on mount
- `loop`: Continuous playback
- `muted`: Initial muted state (required for autoplay on mobile)
- `controls`: Native playback controls
- `playsinline`: iOS/Android inline playback
- `poster`: Poster image before playback
- `aspect-ratio`: Enforced aspect ratio (e.g., 16:9, 4:3, 1:1)
- `object-fit`: Fill behavior (contain, cover, fill)
- `width` / `height`: Explicit dimensions or responsive sizing
- `position`: Positioning within container (static, relative, absolute)

**Responsive Behavior**
- Inherit width/height from parent container
- `max-width: 100%` for fluid scaling
- `height: auto` to maintain aspect ratio
- Breakpoint-specific video configurations
- Mobile-optimized playback (autoplay disabled, controls enabled)

**Lazy Loading**
- `loading="lazy"` attribute for below-the-fold videos
- IntersectionObserver for viewport-based loading
- Priority loading for above-the-fold videos
- Placeholder images during load state

**Video Background Sections**
- Full-width/height background videos
- Parallax or fixed-position backgrounds
- Overlay color/gradient for text readability
- Muted + autoplay required for autoplay on all browsers
- `object-fit: cover` with `aspect-ratio` maintenance

**Media Metadata**
```json
{
  "id": "unique-asset-id",
  "type": "image|video|audio|icon|font",
  "filename": "original-filename.jpg",
  "url": "https://cdn.example.com/path/to/file",
  "mimeType": "image/jpeg|video/mp4|audio/mpeg",
  "dimensions": {"width": 1920, "height": 1080},
  "duration": 12.5,  // seconds (videos/audio only)
  "fileSize": 2048576,  // bytes
  "poster": "/posters/video-cover.jpg",  // video only
  "altText": "Description for accessibility",
  "uploadTimestamp": "2026-09-27T10:30:00Z",
  "tags": ["hero", "background", "product"],
  "category": "hero|background|feature|product|team",
  "status": "active|archiving|deleted",
  "cdnUrl": "https://cdn.example.com/optimized/path",
  "optimizedFormats": ["webp", "mp4-1080p", "mp4-720p"],  // images/videos only
  "thumbnail": "/thumbnails/video-cover.jpg"  // videos only
}
```

### Media Management

**Search & Filter**
- Search by filename, tags, category, type
- Filter by media type, status, category, upload date
- Sort by name, size, duration, upload date
- Regex-supported search queries

**Preview System**
- Grid view: Thumbnail grid with metadata overlay
- List view: Details list with filename, size, type, dimensions
- Player preview: Hover-to-preview for videos (HTML5 video snapshot)
- SVG preview: Code view for SVG assets

**Rename & Replace**
- Rename asset: Update filename and all references
- Replace asset: Swap file while preserving metadata and usage
- Duplicate detection: Detect duplicate assets and suggest merge
- Version tracking: Basic version history for replace operations

**Usage Tracking**
- Track which pages/components/sections use each asset
- Highlight "unused assets" for cleanup
- Cascade delete: Remove asset references when asset is deleted
- Dependency map: Visual map of asset usage across the project

### Future Backend Readiness

**Data Model Design for Cloud Storage**
The asset data model is designed to support migration from local client-side storage to cloud-backed storage without breaking changes:

```json
{
  "storage": {
    "type": "local|cloud|hybrid",
    "localPath": "/relative/path/in/project",  // for local storage
    "cloudId": "r2-uuid-or-s3-key",  // for cloud storage
    "cdnUrl": "https://cdn.example.com/optimized/path",
    "backup": {
      "enabled": true,
      "lastBackup": "2026-09-27T02:00:00Z",
      "frequency": "daily"
    }
  }
}
```

**Cloud Storage Integration (Phase 5+)**
- **Cloudflare R2**: S3-compatible storage with no egress fees
- **Amazon S3**: Full-featured object storage
- **Google Cloud Storage**: Integrated with Google Cloud ecosystem
- **CDN Integration**: Automatic CDN invalidation and cache invalidation
- **Video Transcoding**: Automatic generation of multiple resolutions (360p, 720p, 1080p, 4K)
- **Optimized Formats**: WebP/WebM for images, MP4/H.264 for video
- **Thumbnail Generation**: Automated poster frame extraction
- **Large-file Uploads**: Chunked upload support for files > 100MB
- **Signed URLs**: Temporary access links for secure file sharing

### Architecture Integration

**Media Library ↔ Asset Manager**
- The Media Library is the next-generation replacement for the existing Asset Manager
- Existing asset references in localStorage are migrated on first access
- New assets are stored in the Media Library; legacy assets remain readable
- API compatibility layer for existing `AssetManager` imports during transition

**Media Library ↔ Component System**
- Components reference assets by `assetId` from the Media Library
- Component property panels include Media Library browser for selecting images/videos
- Video components auto-detect `poster`, `autoplay`, `loop`, `muted` from associated media
- Replacing media in a component updates all instances globally

**Media Library ↔ Section Builder**
- Section backgrounds can reference Media Library assets
- Section video sections pull configuration from the Media Library
- Reusable sections preserve their media references
- Media optimization warnings for sections with oversized assets

**Media Library ↔ Style Engine**
- Design tokens can reference Media Library asset IDs
- Color tokens can use asset colors (extracted from images)
- Background tokens can reference video assets with all player controls
- Responsive breakpoint styles can have different media assets per breakpoint

**Media Library ↔ Responsive Builder**
- Different assets can be assigned per breakpoint (e.g., different hero image for mobile vs desktop)
- `srcset` support for images with automatic WebP/AVIF fallback
- Video sources can be swapped per breakpoint
- Lazy loading configuration per breakpoint

**Media Library ↔ EditorState**
- Media state persisted to `pe-editor-state-v1` with migration path
- Asset selections in EditorState reference Media Library IDs
- Undo/redo history tracks media swaps and replacements
- Session state includes current Media Library configuration

**Media Library ↔ History / Undo-Redo**
- Media upload, replace, and delete operations recorded in undo stack
- Media swap operation: records old assetId, new assetId, affected components
- Restoration of media state on undo/redo
- Snapshot intervals include Media Library configuration

### Data Model Extensions (editor-state.js)

The EditorState is extended with Media Library configuration:

```javascript
state: {
  // ... existing properties
  
  // Media Library state
  mediaLibrary: {
    assets: {},  // assetId -> mediaMetadata
    currentFolder: "root",
    selectedAssetId: null,
    gridView: true,  // true = grid, false = list
    page: 1,  // current page of results
    pageSize: 20
  },
  
  // Video-specific state
  videoPlayerConfig: {
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
    playsinline: true,
    aspectRatio: "16:9"
  }
}
```

### Updated Success Criteria

- [ ] Media Library: upload, search, filter, preview, rename, replace, delete operations
- [ ] Video component: local video, YouTube/Vimeo embed, background video, all player controls (autoplay, loop, muted, controls)
- [ ] Video responsiveness: breakpoints, aspect ratio maintenance, lazy loading
- [ ] Media metadata: id, type, filename, URL, MIME type, dimensions, duration, file size, poster, alt text, tags, categories
- [ ] Media management: usage tracking, dependency mapping, unused asset detection
- [ ] Future backend readiness: data model supports Cloudflare R2/S3, video transcoding, optimized formats
- [ ] Architecture integration: Media Library works with Component System, Section Builder, Style Engine, Responsive Builder, EditorState, and History
- [ ] All Phase 1-3 features remain functional with Media Library integration
- [ ] `node tools/build.js` completes with no errors

### Updated Risks

**Risk 7 (modified): Asset Management Scale**
- **Risk**: Media Library could become slow with hundreds of assets
- **Mitigation**: Asset indexing with search optimization; pagination in browser; thumbnail caching; lazy load of asset previews; optional cloud offloading of originals; keep optimized derivatives in client storage

**Risk 8 (modified): Undo/Redo State Loss**
- **Risk**: Media swap operations could leave orphan references
- **Mitigation**: Dependency mapping on replace; cascade delete confirmation; snapshot before major media operations; export/import media library state

### Updated Dependencies

**External Dependencies** (additions):
| Package | Purpose | Version |
|---------|---------|---------|
| Lozad.js | Native lazy loader — 0.5KB | v1.17.0 |
| VueUse useDraggable | Drag-and-drop for asset upload | v4.0.0 |
| Mux | Video tracking and analytics | latest |
| Analytics-as-code | Video playback analytics | latest |

**Browser APIs Used** (additions):
- `URL.createObjectURL` / `URL.revokeObjectURL` — Local video preview
- `File` API — File reading for upload previews
- `Blob` — Video chunking for large files
- `WebKitAudioContext` — Audio context for future audio support

### Implementation Phases — Media System Addition

**Phase 4.0 (Weeks 1-2) — Media Library Foundation**
- [ ] Create Media Library data model in EditorState
- [ ] Implement basic asset upload (images only, no video)
- [ ] Create Media Library UI in editor.html (grid/list view)
- [ ] Implement search and filter functionality
- [ ] Add lazy loading for image assets
- [ ] Verify Phase 1-3 features still work with Media Library integration

**Phase 4.2 (Weeks 5-6) — Video Support**
- [ ] Add video upload and external video URL support
- [ ] Implement video metadata extraction (duration, dimensions)
- [ ] Add poster image support for videos
- [ ] Implement video player controls (autoplay, loop, muted, controls)
- [ ] Add responsive video configurations per breakpoint
- [ ] Add video background section configuration
- [ ] Add lazy loading for videos with IntersectionObserver

**Phase 4.4 (Weeks 9-10) — Media Management**
- [ ] Implement rename and replace operations
- [ ] Add usage tracking and dependency mapping
- [ ] Implement unused asset detection
- [ ] Add duplicate detection
- [ ] Add rename cascade updates

**Phase 4.8 (Weeks 17-18) — Media Backend & Polish**
- [ ] Design cloud storage migration path (R2/S3)
- [ ] Implement video transcoding pipeline setup
- [ ] Add optimized format generation (WebP, AV1)
- [ ] Add batch operations (bulk upload, bulk delete)
- [ ] Add advanced search (tags, categories, metadata)
- [ ] User testing of Media Library workflows

### Summary of Changes

The following sections of PHASE4_PLAN.md have been updated/added:

1. **Section 8: Media Library** — Completely rewritten from the previous Asset Manager section to encompass a full media system supporting images, videos, audio (future), icons, and fonts with comprehensive video player controls, metadata, management operations, and future backend readiness.

2. **Section 3: Component System** — Will be updated separately to reference Media Library assets and include detailed video component specifications.

3. **Success Criteria (line 769)** — Updated to include Media Library and video-related items.

4. **Risks (lines 727-733)** — Updated to address Media Library-specific risks.

5. **Dependencies (lines 737-761)** — Added external packages and browser APIs for media support.

6. **Implementation Phases** — Added Media Library foundation (Phase 4.0), video support (Phase 4.2), media management (Phase 4.4), and media backend/polish (Phase 4.8) to the 8-phase rollout.

7. **Data Models** — Added comprehensive media metadata JSON schema and EditorState extensions.

8. **Architecture Integration** — Documented how the Media Library integrates with all other Phase 4 systems (Asset Manager, Component System, Section Builder, Style Engine, Responsive Builder, EditorState, History/Undo-Redo).

---

## 9. History System

### Real Undo/Redo Architecture
- **Operation-based undo**: Each action is an operation with undo/redo functions
- **Undo stack**: Persisted to localStorage with session management
- **Redo stack**: Restore actions after undo
- **Snapshot system**: Periodic DOM snapshots for complex state restoration
- **Batch operations**: Group related changes (e.g., moving 3 elements = 1 undo step)

### Undo Queue Structure
```json
{
  "undoStack": [
    {
      "id": "op-1",
      "timestamp": "2026-09-27T10:30:00Z",
      "type": "element-edit",
      "elementId": "h1-1",
      "property": "innerText",
      "oldValue": "Previous Text",
      "newValue": "Updated Text",
      "action": "edit-text"
    },
    {
      "id": "op-2",
      "timestamp": "2026-09-27T10:31:00Z",
      "type": "section-add",
      "sectionId": "section-2",
      "pageId": "index.html",
      "action": "add-section"
    }
  ],
  "redoStack": [],
  "maxStackSize": 100,
  "snapshotInterval": 50 // save snapshot every 50 operations
}
```

### New API Methods (history.js - new file)
- `History.undo()` — Undo last operation
- `History.redo()` — Redo undone operation
- `History.canUndo()` — Check if undo available
- `History.canRedo()` — Check if redo available
- `History.recordOperation(operation)` — Record new operation
- `History.clearRedoStack()` — Clear redo stack when new action performed
- `History.saveSession()` — Persist session state to localStorage
- `History.loadSession()` — Restore session state from localStorage

---

## 10. Design Tokens

### Global Design System
- **Colors**: Primary, secondary, neutral, semantic colors with shades
- **Typography**: Font families, sizes, weights, line heights, letter spacing at all breakpoints
- **Spacing**: 8-point system (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px)
- **Radii**: Border radius tokens (sm, md, lg, full)
- **Shadows**: Elevation shadows, inset shadows
- **Effects**: Blur, opacity, blend modes

### Token Data Model
```json
{
  "tokens": {
    "colors": {
      "primary": "#3b82f6",
      "primary-50": "#eff6ff",
      "primary-100": "#dbeafe",
      // ... shade system
      "neutral-50": "#fafafa",
      "neutral-900": "#111111"
    },
    "typography": {
      "font-family-base": "Inter, system-ui, sans-serif",
      "font-size-1": "0.75rem",
      "font-size-2": "0.875rem",
      "font-size-3": "1rem",
      "font-size-4": "1.25rem",
      "font-size-5": "1.5rem",
      "font-weight-normal": "400",
      "font-weight-bold": "700",
      "line-height-normal": "1.6",
      "letter-spacing-tight": "-0.025em"
    },
    "spacing": {
      "space-1": "0.25rem",
      "space-2": "0.5rem",
      "space-3": "0.75rem",
      "space-4": "1rem",
      "space-5": "1.5rem",
      "space-6": "2rem",
      "space-8": "3rem",
      "space-10": "4rem"
    },
    "radii": {
      "radius-sm": "0.125rem",
      "radius-md": "0.25rem",
      "radius-lg": "0.5rem",
      "radius-full": "9999px"
    },
    "shadows": {
      "shadow-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "shadow-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      "shadow-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    }
  }
}
```

### New API Methods (design-tokens.js - new file)
- `DesignTokens.getToken(tokenName)` — Retrieve design token value
- `DesignTokens.setToken(tokenName, value)` — Define/update design token
- `DesignTokens.applyTokenToElement(element, tokenName)` — Apply token to element style
- `DesignTokens.generateCSSVariables(tokens)` — Generate CSS :root variables
- `DesignTokens.importFromCSS(cssText)` — Import existing CSS tokens

---

## Required Files Architecture (Phase 4)

### New Files to Create
| File | Purpose |
|------|---------|
| `admin/page-manager.js` | Advanced page management (pages, SEO, versions, status) |
| `admin/section-builder.js` | Professional section builder (templates, reusable sections, layout) |
| `admin/component-system.js` | Component library (text, image, button, cards, gallery, custom) |
| `admin/style-engine.js` | Advanced style engine (typography, spacing, layout, borders, shadows, backgrounds) |
| `admin/responsive-builder.js` | Responsive design management (breakpoints, per-breakpoint styles) |
| `admin/animation-system.js` | Animation system (entrance, hover, scroll animations) |
| `admin/layers-panel.js` | Layers/hierarchy tree (select, lock, hide, reorder, group) |
| `admin/asset-manager.js` | Asset management (images, videos, icons, fonts) |
| `admin/history.js` | Undo/redo architecture with operation-based history |
| `admin/design-tokens.js` | Design token system (colors, typography, spacing, radii, shadows) |
| `admin/state-extension.js` | Extend EditorState for new Phase 4 state properties |

### Modified Files (extend existing, don't replace)
- `admin/editor.html` — Add CMS builder toolbar, panels, responsive mode toggles
- `admin/editor-state.js` — Add Phase 4 state properties, extend persistence
- `admin/dom-manager.js` — Add new lookup methods for layers, components, assets

### Unchanged Files
- `assets/js/main.js` — Public website (completely untouched)
- `tools/build.js` — Build configuration

---

## Data Models Summary

### Core State Extension (editor-state.js)
```javascript
state: {
  isEditMode: false,
  selectedElement: null,
  editingElement: null,
  currentPage: 'index.html',
  currentSection: null,
  currentComponent: null,
  currentBreakpoint: 'desktop',
  revision: 0,
  elementIdCounter: 0,
  idMap: new Map(),
  
  // Phase 4 extensions
  pages: {}, // pageId -> pageData
  activePage: 'index.html',
  pageStatus: 'published', // draft | published | archived
  seoMetadata: {},
  version: 1,
  versionHistory: [],
  
  // Section builder
  sections: {}, // sectionId -> sectionData
  reusableSections: {}, // sectionId -> reusableData
  
  // Component system
  components: {}, // componentId -> componentData
  
  // Style engine
  designTokens: {}, // tokenName -> tokenValue
  styleCache: {}, // elementId -> computed styles
  
  // Responsive
  breakpoints: {desktop, tablet, mobile},
  currentBreakpoint: 'desktop',
  styleOverrides: {}, // { [property]: { desktop, tablet, mobile } }
  
  // Animations
  animations: {}, // elementId -> animationConfig
  
  // Layers
  layers: [], // hierarchy tree
  lockedLayers: Set,
  hiddenLayers: Set,
  
  // Assets
  assets: {}, // assetId -> assetData
  
  // History
  undoStack: [],
  redoStack: [],
  sessionId: ''
}
```

### localStorage Schema (`pe-editor-state-v1` extended)
Extended schema includes all Phase 4 data while maintaining backward compatibility with existing stored data.

---

## Implementation Phases

### Phase 4.0 — Foundation (Weeks 1-2)
- Set up new file structure
- Extend EditorState with Phase 4 properties
- Create design-tokens module with default token set
- Build history system with undo/redo
- Implement asset manager basic API
- Ensure Phase 1-3 features remain functional

### Phase 4.1 — Page Management (Weeks 3-4)
- Create page-manager module
- Page creation/duplication/deletion
- SEO metadata UI in toolbar
- Draft/published status toggle
- Version history tracking
- Page reordering

### Phase 4.2 — Section Builder (Weeks 5-6)
- Section templates library
- Reusable sections system
- Section settings panel
- Layout controls (grid, columns, gap)
- Background controls (color, image, gradient)
- Spacing controls (padding, margin)
- Responsive layout per breakpoint

### Phase 4.3 — Component System (Weeks 7-8)
- Text and heading components
- Image component with optimization
- Button component with multiple styles
- Cards component system
- Gallery component
- Custom component framework
- Component property controls

### Phase 4.4 — Style Engine (Weeks 9-10)
- Typography control panel
- Spacing controls integration
- Layout engine (flex/grid)
- Borders and shadows panel
- Background systems
- Design token application
- CSS variable generation

### Phase 4.5 — Responsive Builder (Weeks 11-12)
- Breakpoint management UI
- Per-breakpoint style overrides
- Responsive visibility controls
- Mobile-first workflow
- Breakpoint switching in toolbar

### Phase 4.6 — Animation System (Weeks 13-14)
- Entrance animation library
- Hover animation configuration
- Scroll trigger animations
- Animation panel in inspector
- Easing curve selector
- Animation preview

### Phase 4.7 — Layers Panel (Weeks 15-16)
- Hierarchy tree component
- Layer select/lock/hide actions
- Drag-and-drop reordering
- Grouping functionality
- Search through layers

### Phase 4.8 — Polish & Testing (Weeks 17-18)
- Cross-browser testing
- Performance optimization
- Build verification (`node tools/build.js`)
- Documentation
- Bug fixes
- User testing

---

## Risks & Mitigations

### Risk 1: Build Breakage
- **Risk**: New modules could break existing `node tools.build.js`
- **Mitigation**: Each new module exports clean API; run build after each addition; maintain backward compatibility shims

### Risk 2: localStorage Size Limits
- **Risk**: Extended state could exceed localStorage quota (typically 5MB)
- **Mitigation**: Implement data pruning; remove old versions beyond retention limit; use sessionStorage for transient state; compress JSON where possible

### Risk 3: Iframe DOM Access Conflicts
- **Risk**: New style/animation systems could conflict with existing iframe DOM access
- **Mitigation**: All modifications go through established `EditorState` and `DomManager` APIs; thorough testing of element selection/inspection flow

### Risk 4: Performance with Complex Pages
- **Risk**: Complex pages with many elements/animations could cause lag
- **Mitigation**: Debounced style updates; requestAnimationFrame for animations; virtual DOM where possible; memoized component rendering; lazy loading of non-essential features

### Risk 5: Phase 1-3 Compatibility
- **Risk**: New features could break existing element editing
- **Mitigation**: Feature flags per capability; comprehensive test suite for Phase 1-3 operations; regression testing after each development sprint

### Risk 6: Data Migration on Update
- **Risk**: Users upgrading from Phase 3 lose existing work
- **Mitigation**: Backward compatible localStorage schema merge; migration script that preserves existing data; clear upgrade path documentation

### Risk 7: Media Library Scale
- **Risk**: Media Library could become slow with hundreds of assets, especially video files
- **Mitigation**: Asset indexing with search optimization; pagination in browser; thumbnail caching; lazy load of asset previews; optional cloud offloading of originals; keep optimized derivatives in client storage; implement asset type-based pruning (auto-archive deleted assets after 90 days)

### Risk 8: Undo/Redo State Loss (modified)
- **Risk**: Media swap operations could leave orphan references in components/sections
- **Mitigation**: Dependency mapping on replace; cascade delete confirmation; snapshot before major media operations; export/import Media Library state; track media usage count and auto-archive unused assets

---

## Dependencies

### External Dependencies (CDN or npm)
| Package | Purpose | Version |
|---------|---------|---------|
| @fontsource/inter | Google Fonts optimization | latest |
| lucide-react/icons | Icon library for UI | latest |
| css.escape | CSS selector escaping | latest |
| tinycolor2 | Color manipulation | latest |
| lozad.js | Native lazy loader — 0.5KB | v1.17.0 |
| vide.js | Video player library | v1.8.0 |
| mux-js | Video analytics and tracking | v5.4.0 |

### Browser APIs Used
- `localStorage` — State persistence (up to ~5MB)
- `sessionStorage` — Transient state
- `CustomEvent` — Event dispatching
- `DOMParser` — CSS/HTML parsing
- `FileReader` — Asset upload parsing
- `ResizeObserver` — Element size tracking
- `IntersectionObserver` — Scroll animation triggers and lazy loading
- `URL.createObjectURL` / `URL.revokeObjectURL` — Local video preview
- `File` API — File reading for upload previews
- `Blob` — Video chunking for large files

### Optional Integrations (Phase 5+)
- Cloudflare Images API — Optimized image delivery
- Cloudinary — Asset management service
- Google Fonts API — Real-time font loading
- Analytics integration — Usage tracking (opt-in)
- Collaboration features — Multi-user cursor, comments (Phase 5)

---

## Success Criteria (Phase 4 Complete)

- [ ] Page management: create, duplicate, delete, SEO, versions, status
- [ ] Section builder: templates, reusable sections, layout, background, spacing, responsive
- [ ] Component system: text, heading, image, video, button, cards, gallery working
- [ ] Style engine: full typography, spacing, layout, borders, shadows, backgrounds
- [ ] Responsive: desktop/tablet/mobile modes with per-breakpoint overrides
- [ ] Animations: entrance, hover, scroll working with preview
- [ ] Layers panel: hierarchy tree, select, lock, hide, reorder, group
- [ ] Media Library: upload, search, filter, preview, rename, replace, delete
- [ ] Video component: local video, YouTube/Vimeo embed, background video, all player controls
- [ ] Video responsiveness: breakpoints, aspect ratio maintenance, lazy loading
- [ ] Media metadata: id, type, filename, URL, MIME type, dimensions, duration, file size, poster, alt text, tags, categories
- [ ] Media management: usage tracking, dependency mapping, unused asset detection
- [ ] Style engine: full typography, spacing, layout, borders, shadows, backgrounds
- [ ] Responsive: desktop/tablet/mobile modes with per-breakpoint overrides
- [ ] Animations: entrance, hover, scroll working with preview
- [ ] Layers panel: hierarchy tree, select, lock, hide, reorder, group
- [ ] Asset manager: images, videos, icons, fonts upload and management
- [ ] History: undo/redo works across all editor operations
- [ ] Design tokens: global tokens apply consistently across all components
- [ ] All Phase 1-3 element editing features remain fully functional
- [ ] `node tools/build.js` completes with no errors
- [ ] Public website source files completely untouched
- [ ] Cross-browser compatible (Chrome, Firefox, Safari, Edge)
- [ ] Mobile-responsive editor UI (tablet width minimum)
- [ ] Performance: page load < 2s, editor interaction < 100ms lag

## Phase 5 Roadmap (Future)
- Real-time collaboration (multi-user cursor, comments)
- CMS content management (dynamic content collections)
- E-commerce functionality (product grids, cart, checkout)
- Export/import full site as HTML/CSS/JS
- Hosting integration (Vercel, Netlify deployment)
- AI design assistance (auto-layout, content generation)
- Plugin ecosystem (third-party extensions)