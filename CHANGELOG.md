# ChronoCrosser: Cannabis Cultivator - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (conceptually, as we iterate).

---

## [1.0.0] - 2023-10-27 (Assumed Date - Replace with Actual)

This is the first stable release incorporating core gameplay mechanics, a significantly enhanced user interface, and robust debugging features.

### Added
- **Floating Side Panel Layout:** Breeding Station and Strain Share (Import) sections are now in a sticky side panel for persistent access, with the main content area dedicated to the Plant Nursery.
- **Collapsible Plant Cards:** Plant card information is now organized into collapsible sections ("Core Stats," "Aroma & Appearance," "Genetic Markers") for a cleaner UI.
- **Click-to-Assign Breeding:** Replaced drag-and-drop with a click-based button system on plant card headers for adding/removing plants from breeding slots.
    - Nursery cards feature a "+ Breeder" button (disabled Verhalten if plant is already selected or both slots are full).
    - Cards in breeder slots feature a "Remove" button.
- **Plant Image Lightbox:** Plant Silhouettes on cards are clickable, opening a larger, more detailed SVG visual in a modal.
- **Image & Data Download Functionality:**
    - "Download Image (PNG)" button in the lightbox to save the current plant's visual.
    - "Download Data (JSON)" button in the lightbox to save a plant's detailed trait information.
- **Favicon Integration:** Added various favicon sizes for improved browser and mobile home screen presentation.
- **Centralized Logging Module (`logger.js`):**
    - Implemented configurable log levels (ERROR, WARN, INFO, DEBUG, VERBOSE).
    - Features timestamping and optional module name tagging for log messages.
    - All previous `console.*` calls throughout the application were refactored to use this new logger.
- **Enhanced Debugging:** Added extensive logging and robustness checks throughout the application lifecycle (data loading, plant creation, UI rendering) to aid in troubleshooting.

### Changed
- **UI/UX:** Major redesign moving from a single-flow layout to a main content area with a floating tool panel.
- **Breeding Interaction:** Shifted from drag-and-drop to a click-based system for selecting parent plants.
- **Plant Card Design:** Headers now serve as info displays with action buttons, rather than drag handles. Content is now sectioned and collapsible.
- **Error Handling:** Improved throughout the application with more specific error messages and fallbacks, especially for data loading and UI rendering.
- **Code Structure:** All JavaScript is modular, with clear responsibilities for each file.

### Fixed
- Resolved previous "empty nursery" issue by ensuring correct data flow of `TRAIT_DEFINITIONS` and robust plant/card rendering in `uiManager.js` and `plantFactory.js`.
- Corrected various JavaScript `ReferenceError` and `SyntaxError` issues related to module imports, scope, and exports (e.g., `clamp` in `plantVisuals.js`, `uiManager` object access in `main.js`, `showExportModal` export).
- Addressed issues where `TRAIT_DEFINITIONS` might be `null` or `undefined` in UI rendering functions by ensuring it's correctly passed and checked.
- Stabilized plant visual generation by reverting to a simpler, more robust SVG rendering logic in `js/plantVisuals.js` as a base, while retaining the infrastructure for future visual enhancements.

---

## [0.8.0] - Internal Development Snapshot

### Added
- Conceptual groundwork and initial SVG structures for advanced, blueprint-based plant visuals.
- Stubs and initial HTML for plant image lightbox and download features.

### Changed
- Began overhaul of `js/plantVisuals.js` for more detailed rendering (this was largely reverted/simplified for V1.0 stability).

---

## [0.7.0] - Internal Development Snapshot

### Added
- Initial implementation of the floating side panel layout concept.
- First pass at collapsible sections within plant cards.

---

## [0.6.0] - Internal Development Snapshot

### Added
- **Plant Sex Implementation (Male/Female):**
    - `sex_chromosomes_gene` and refined `sex_stability_gene` added to `traits.json`.
    - Genetic inheritance for sex chromosomes and determination of `expressedSex`.
    - UI updated to show sex symbols; breeding logic requires M/F pairs.
    - Yield calculation now affected by plant sex and hermaphrodite risk.
- **Drag and Drop for Breeding Selection:** Initial D&D system (later replaced in V1.0).
- **Expanded Strain Namer:** New word categories and patterns for varied/humorous names.
- **Lineage Tooltip Details:** Tooltip enhanced to show key traits of ancestors.

---

## [0.5.0] - Internal Development Snapshot

### Added
- **Strain Card Export/Import:** JSON-based export/import of plant data.
- **Plant Deletion:** Functionality to delete plants from the nursery.
- **CSS Theming:** Introduced CSS Custom Properties; applied a "Neon" theme based on game logo.

### Changed
- **Major Refactoring:** Monolithic `game.js` broken down into multiple ES6 modules.
- **CSS:** Significant cleanup and organization.

### Fixed
- Corrected path for fetching `traits.json`.

---

## [0.4.0] - Internal Development Snapshot

### Added
- **External Trait Definitions:** Game loads traits from `traits.json`.
- **Genetic Risk Traits:** Implemented dominant/recessive genes for `sex_stability_gene` (formerly `hermaphrodite_gene`) and `pest_susceptibility_gene`.
- **Yield Calculation:** Replaced "Density" with "Genetic Yield Potential"; calculated yield in grams.

---

## [0.3.0] - Internal Development Snapshot

### Added
- **Lineage Tracking Tooltip:** Text-based family tree on plant card hover.
- **Improved Plant Silhouette:** More cannabis-like palmate leaf structures in SVG.

---

## [0.2.0] - Internal Development Snapshot

### Added
- Basic genetic inheritance model (numerical averaging, categorical selection + mutation).
- Procedural strain naming.
- Dynamically generated basic SVG plant silhouettes.
- Basic UI for nursery, breeding station, and offspring display.

---

## [0.1.0] - Internal Development Snapshot

### Added
- Project Inception: Initial HTML, CSS, and single JavaScript file setup.
- Conceptualized core game mechanics and initial data structures.

---