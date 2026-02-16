# Agent Instructions for valex.github.io

This is a static website built with Pug templates, vanilla JavaScript (ES6+), and D3.js for interactive visualizations. The site is deployed on GitHub Pages.

## Project Structure

- `src/templates/` - Pug templates for HTML generation
- `resources/js/` - JavaScript files (ES6 modules)
- `resources/css/` - Stylesheets
- `models/` - 3D model files (.glb) for coin visualizations
- `data/` - JSON data files
- `pug.js` - Build script that compiles Pug templates to HTML
- `_config.yml` - Jekyll configuration for GitHub Pages

## Build Commands

```bash
# Build all HTML files from Pug templates
bash build.sh

# Or run directly with Node
node pug.js
```

**Note**: There is currently no linting, testing, or CI/CD configured for this project.

## Adding New Pages

To add a new page:

1. Add an entry to the `pages` array in `pug.js` with these properties:
   - `slug` (required): URL-friendly identifier
   - `theme` (required): Category/theme for the page
   - `meta_description` (required): SEO description
   - `meta_keywords` (required): SEO keywords
   - `meta_title` (required): Page title
   - `title` (required): Display title
   - `script_module` (optional): Set to `true` for ES6 module scripts
   - `alternates` (optional): For multilingual support (e.g., German translations)

2. Create `src/templates/{slug}.pug` extending `basic.pug` or as standalone

3. Create `resources/js/{slug}.js` if the page needs JavaScript

4. Create `resources/css/{slug}.css` for page-specific styles

5. Run `bash build.sh` to generate the HTML

## Code Style Guidelines

### JavaScript

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required at end of statements
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants
- **Imports**: Use ES6 module syntax (`import`/`export`)
- **Features**: ES6+ allowed (const/let, arrow functions, classes, destructuring)
- **Comments**: Use JSDoc for class/method documentation
- **Error Handling**: Use try-catch for async operations; validate inputs

### Pug Templates

- **Indentation**: 4 spaces
- **File naming**: `snake_case.pug`
- Extend `basic.pug` for standard page layout
- Use block overrides: `content`, `scripts`, `importmaps`
- Mixins should be defined before use

### CSS

- **Indentation**: 4 spaces
- Use Bootstrap 5 classes where possible
- Page-specific styles in separate files
- Prefer classes over IDs for styling

### File Organization

```
src/templates/
  basic.pug          # Base template
  header.pug         # Header component
  footer.pug         # Footer component
  {page_slug}.pug    # Page templates
  de/                # German translations
    {page_slug}.pug

resources/js/
  {page_slug}.js     # Page-specific JS
  donate.js          # Shared donation component

resources/css/
  basic.css          # Shared styles
  {page_slug}.css    # Page-specific styles
```

## Dependencies

Runtime dependencies are loaded via CDN:
- Bootstrap 5.2.0 (CSS/JS)
- D3.js 7.6.1 (for visualizations)
- Three.js (for 3D models, loaded via importmap)
- MathJax (for math rendering)

Dev dependencies (in package.json):
- pug ^3.0.2 (template engine)

## Git Workflow

1. Edit Pug templates in `src/templates/`
2. Edit JS/CSS in `resources/`
3. Run `bash build.sh` to regenerate HTML
4. Commit both source files AND generated HTML files
5. Push to deploy to GitHub Pages

## Common Tasks

**Update page content**: Edit the `.pug` file, then run `bash build.sh`

**Add interactivity**: Create/edit `resources/js/{slug}.js` (use ES6 modules if `script_module: true`)

**Fix styling**: Edit `resources/css/{slug}.css`

**Add new coin 3D view**: Add GLB model to `models/`, create page entry in pug.js

## Notes

- HTML files in root are auto-generated from Pug templates - do not edit them directly
- JavaScript files with `script_module: true` use ES6 module syntax
- D3.js is used for interactive vector visualizations and charts
- Three.js is used for 3D coin model rendering
- The site uses counter.dev for basic analytics
- German translations go in `src/templates/de/` and output to `de/` directory
