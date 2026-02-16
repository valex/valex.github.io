# webua.test Project Overview

## Project Description
webua.test is a static educational website built with Pug templates, vanilla JavaScript (ES6+), and D3.js for interactive visualizations. The site covers topics including programming (JavaScript, Python), mathematics (vectors, complex numbers), cryptocurrency, Linux commands, and geoguessing. It features interactive content like vector operations, 3D coin models, and cryptocurrency tools.

## Architecture & Technologies
- **Template Engine**: Pug (previously Jade) for generating HTML from templates
- **Frontend Framework**: Bootstrap 5.2.0 for responsive design
- **Visualization Library**: D3.js 7.6.1 for interactive math visualizations
- **3D Rendering**: Three.js for 3D coin models
- **Math Rendering**: MathJax for mathematical expressions
- **Analytics**: counter.dev for visitor tracking
- **Deployment**: GitHub Pages compatible

## Project Structure
```
├── _config.yml                 # Jekyll configuration for GitHub Pages
├── build.sh                    # Build script to compile Pug templates
├── pug.js                      # Main build script that processes templates
├── package.json                # Node.js dependencies (pug, fs)
├── requirements.txt            # Python dependencies
├── AGENTS.md                   # Detailed developer instructions
├── index.html                  # Main landing page (auto-generated)
├── ...
├── src/
│   └── templates/              # Pug templates for all pages
├── resources/
│   ├── js/                     # JavaScript files (ES6 modules)
│   └── css/                    # CSS stylesheets
├── models/                     # 3D model files (.glb) for coin visualizations
├── data/                       # JSON data files
├── de/                         # German translation pages
└── ... (generated HTML files)
```

## Building and Running

### Prerequisites
- Node.js (for Pug template compilation)
- Bash (for build script)

### Build Process
```bash
# Install dependencies
npm install

# Build all HTML files from Pug templates
bash build.sh

# Or run directly with Node
node pug.js
```

The build process takes Pug templates from `src/templates/` and generates corresponding HTML files in the root directory. The `index.html` file is also auto-generated from the template.

### Development Workflow
1. Edit Pug templates in `src/templates/`
2. Edit JavaScript/CSS in `resources/`
3. Run `bash build.sh` to regenerate HTML files
4. Commit both source files AND generated HTML files
5. Push to deploy to GitHub Pages

## Adding New Pages

To add a new page to the site:

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

## Dependencies

### Runtime Dependencies (loaded via CDN):
- Bootstrap 5.2.0 (CSS/JS)
- D3.js 7.6.1 (for visualizations)
- Three.js (for 3D models, loaded via importmap)
- MathJax (for math rendering)

### Dev Dependencies (in package.json):
- pug ^3.0.2 (template engine)
- fs (filesystem operations)

### Python Dependencies (in requirements.txt):
- Various packages for system administration and utilities

## Content Categories
The site organizes content into several categories:
- **JavaScript**: DOM manipulation, variables, functions, numbers, strings
- **Interactive Math**: Vector operations, complex numbers, cross products
- **Crypto**: Fear and Greed Index, freebitco.in scripts
- **Linux**: Process management, finding PIDs
- **Geoguessing**: GeoGuessr clue map, language identification
- **Python**: Virtual environments
- **3D Coins**: Interactive 3D models of historical coins
- **Clicker Games**: Automation scripts for cryptocurrency sites

## Special Features
- Multilingual support (English and German)
- Interactive visualizations using D3.js
- 3D coin models using Three.js
- Responsive design with Bootstrap
- SEO-optimized with meta descriptions and keywords
- Built-in analytics with counter.dev