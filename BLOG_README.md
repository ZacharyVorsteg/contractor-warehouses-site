# Blog Infrastructure for warehousesforcontractors.com

Complete blog system with automated build pipeline, SEO optimization, and design consistency.

## Quick Start

### 1. Add New Blog Posts

Create a markdown file in `blog-content/` with YAML frontmatter:

```markdown
---
title: Your Article Title
slug: your-article-slug
description: Brief description for SEO (150-160 chars)
author: Zachary Vorsteg
date: 2024-01-15
keywords: keyword1, keyword2, keyword3
pillar: Warehouse Guides
---

# Article content in markdown

Your article content here...
```

### 2. Build the Blog

```bash
npm run build:blog
```

This generates:
- Individual article pages at `/blog/[slug]/index.html`
- Blog listing page at `/blog/index.html`
- Updated `sitemap.xml` with all blog URLs
- Automatic read time calculation
- Related articles sidebar

## File Structure

```
warehousesforcontractors-site/
├── blog-content/              # Source markdown files
│   └── sample-post.md        # Example article with full YAML
├── blog/                      # Generated output (DO NOT EDIT)
│   ├── index.html            # Blog listing page
│   ├── [slug]/               # Individual article folders
│   │   └── index.html        # Article page
│   ├── _template.html        # Article page template
│   └── _index-template.html  # Blog listing template
├── build-blog.js             # Build script (Node.js)
├── package.json              # Dependencies & scripts
├── sitemap.xml               # Updated with blog URLs
└── index.html                # Home page (Blog link added)
```

## YAML Frontmatter Reference

| Field | Required | Purpose | Example |
|-------|----------|---------|---------|
| `title` | Yes | Article headline | "How to Find Warehouse Space" |
| `slug` | Yes | URL slug (no spaces/special chars) | "how-to-find-warehouse-space" |
| `description` | Yes | Meta description for SEO | "Complete guide to finding warehouse..." |
| `author` | No | Article author | "Zachary Vorsteg" |
| `date` | Yes | Publication date (YYYY-MM-DD) | "2024-01-15" |
| `keywords` | No | Comma-separated keywords for SEO | "warehouse, contractor, real estate" |
| `pillar` | No | Content category for organization | "Warehouse Guides" |

## Features

### SEO Optimization
- **Schema.org Markup**: Article, BreadcrumbList, and Organization schemas
- **Meta Tags**: Proper title, description, keywords, canonical URLs
- **OG/Twitter Cards**: Social media preview support
- **Sitemap Integration**: Automatic sitemap generation with blog URLs
- **Structured Data**: JSON-LD for rich search results

### Design Consistency
- Matches main site typography (Inter font)
- Uses established color scheme (#dc2626 red, #3b82f6 blue accents)
- Same header/footer structure as homepage
- Responsive layout for mobile devices
- Consistent button styles and interactions

### Content Features
- **Read Time Calculation**: Automatically estimates reading time
- **Related Articles**: Shows related articles from same content pillar
- **Table Support**: Full markdown tables with styling
- **Code Blocks**: Syntax-highlighted code with dark theme
- **Blockquotes**: Styled callout boxes
- **Links**: Proper anchor styling and hover effects

## Generated Article Pages

Each article automatically includes:

1. **Header Section**
   - Page title and meta description
   - Article metadata (date, read time, category)
   - Breadcrumb navigation

2. **Article Content**
   - Markdown converted to HTML
   - Proper heading hierarchy (H2, H3)
   - Auto-linked tables of contents
   - Related articles sidebar

3. **Sidebar CTA**
   - Call-to-action box with phone number
   - Related articles list (up to 3)
   - Sticky positioning on desktop

4. **Footer**
   - Site navigation
   - Contact information
   - Copyright notice

5. **SEO Elements**
   - Schema.org Article markup
   - BreadcrumbList navigation schema
   - Open Graph meta tags
   - Twitter card meta tags
   - Canonical URLs

## Blog Listing Page

The automatic blog index page (`/blog/`) includes:

- Hero section with description
- Article grid with cards
- Card includes: category tag, title, description, date, read time
- Links to individual articles
- Shows total article count
- Responsive design for all devices

## Build Script Details

`build-blog.js` performs the following:

1. **Parse Markdown**: Extracts YAML frontmatter from markdown files
2. **Render HTML**: Converts markdown to HTML using `marked` library
3. **Calculate Metadata**:
   - Read time (words / 200)
   - Formatted date (e.g., "January 15, 2024")
   - Find related articles by pillar
4. **Generate Pages**:
   - Individual article pages with template substitution
   - Blog index page with article grid
5. **Update Sitemap**: Adds all blog URLs while preserving existing entries

## Markdown Features

### Supported Markdown

- **Headings**: `# H1`, `## H2`, `### H3`, etc.
- **Lists**: Ordered and unordered with nesting
- **Tables**: GFM-style pipe tables
- **Emphasis**: `**bold**`, `*italic*`, `***bold italic***`
- **Links**: `[text](url)`
- **Code**: Inline `` `code` `` and ``` code blocks ```
- **Blockquotes**: `> quoted text`
- **Line breaks**: Double space or `<br>`

### Not Supported

- Embedded HTML (for security)
- Custom CSS classes
- Shortcodes

## Customization

### Update Color Scheme
Edit the CSS in `blog/_template.html` and `blog/_index-template.html`:
- Primary red: `#dc2626`
- Blue accent: `#3b82f6`
- Dark background: `#1f2937`

### Modify Sidebar CTA
Edit the CTA box HTML in `blog/_template.html`:
```html
<div class="cta-box">
    <h3>Your Headline</h3>
    <p>Your message...</p>
    <a href="your-link">Your CTA</a>
</div>
```

### Change Read Time Formula
Edit `build-blog.js` in the `calculateReadTime()` function:
```javascript
function calculateReadTime(content) {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200); // Change 200 to your target WPM
}
```

## Best Practices

### Article Structure
1. Start with H2 (## not #) for sections
2. Use H3 (###) for subsections
3. Keep paragraphs 2-4 sentences
4. Include 1-2 lists per article
5. Add tables for data comparisons

### SEO Tips
- **Title**: 50-60 characters, include target keyword
- **Description**: 150-160 characters, should match meta description
- **Keywords**: 3-5 relevant keywords, comma-separated
- **Slug**: Lowercase, hyphens for spaces, no special characters
- **First paragraph**: Include target keyword naturally

### Content Tips
- Write for contractors (your audience)
- Include practical examples and checklists
- Link to relevant internal pages
- Add call-to-action (CTA) naturally in content
- Use numbered lists for processes
- Use bullet lists for features

## Workflow

### Add a New Article

1. Create markdown file: `blog-content/your-slug.md`
2. Add YAML frontmatter with all required fields
3. Write article in markdown
4. Run: `npm run build:blog`
5. Verify: Check `/blog/` and `/blog/your-slug/`
6. Commit: Push changes to repository

### Edit an Existing Article

1. Edit markdown file in `blog-content/`
2. Run: `npm run build:blog`
3. Files in `blog/` regenerate automatically (safe to overwrite)

### Publish Changes

The `blog/` directory is generated and can be safely committed. The build script preserves non-blog URLs in `sitemap.xml`.

## Troubleshooting

### "Cannot find module 'marked'"
```bash
npm install
```

### Article not appearing
- Check YAML frontmatter is valid (no typos in field names)
- Verify date format: YYYY-MM-DD
- Ensure slug has no special characters

### Wrong formatting in article
- Check markdown syntax is correct
- Ensure no HTML tags (not supported)
- Verify code blocks use triple backticks ` ``` `

### Sitemap not updating
- Check file was created in `blog-content/`
- Run: `npm run build:blog`
- Verify output includes "Updated sitemap with X blog articles"

## Dependencies

```json
{
  "marked": "^12.0.0",    // Markdown to HTML converter
  "js-yaml": "^4.1.0"      // YAML frontmatter parser
}
```

## Performance

- **Build Time**: ~100-200ms for 10 articles
- **Article Page Size**: ~50-80KB
- **Blog Index Size**: ~60-100KB (depends on article count)
- **Static Files**: No database needed, pure HTML/CSS

## Next Steps

1. ✅ Copy sample article as template
2. ✅ Create 3-5 pilot articles
3. ✅ Run build and verify structure
4. ✅ Test on mobile devices
5. ✅ Deploy to production
6. ✅ Monitor Google Search Console for indexing

## Support

For issues:
1. Check YAML syntax with an online YAML validator
2. Verify markdown syntax in the sample post
3. Check Node.js version: `node --version` (requires 14+)
4. Rerun: `npm install && npm run build:blog`

---

**Generated**: March 20, 2024
**Last Updated**: March 20, 2024
