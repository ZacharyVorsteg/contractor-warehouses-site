# Quick Start: Add Articles to Blog

## 30-Second Overview

1. Create `.md` file in `blog-content/`
2. Add YAML frontmatter (see template below)
3. Write markdown content
4. Run: `npm run build:blog`
5. Done! Article is live at `/blog/[slug]/`

## Article Template

Copy this to `blog-content/your-article-slug.md`:

```markdown
---
title: Article Title (50-60 characters, include keyword)
slug: article-title-slug-no-spaces
description: Meta description (150-160 characters, appears in search results)
author: Zachary Vorsteg
date: 2024-03-20
keywords: warehouse, contractor, real estate
pillar: Warehouse Guides
---

# Article Starts Here

Write your article in markdown. Start with H2 (##), not H1.

## Section Heading

Content goes here.

### Subsection

More content.

## Checklist Example

- Item 1
- Item 2
- Item 3

## Table Example

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |

**Bold text** and *italic text* work as expected.

[Links](https://example.com) work too.
```

## Common Frontmatter Values

**Pillar** options (use for related articles):
- Warehouse Guides
- Market Trends
- Contractor Tips
- Legal/Compliance
- Financing
- Location Guides

## Build Command

```bash
npm run build:blog
```

Output:
- ✅ `/blog/[slug]/index.html` - Article page
- ✅ `/blog/index.html` - Blog listing updated
- ✅ `sitemap.xml` - Updated with new URL

## File Checklist

Before running build, verify:
- [ ] File is in `blog-content/`
- [ ] Filename matches slug (e.g., `awesome-guide.md`)
- [ ] YAML section between `---` markers
- [ ] All required fields: title, slug, description, date
- [ ] Slug uses lowercase and hyphens only
- [ ] Date format: YYYY-MM-DD
- [ ] Content starts with `##` (H2), not `#` (H1)

## SEO Tips

- **Title**: Include main keyword, 50-60 characters
- **Slug**: Same as title but lowercase with hyphens
- **Description**: Natural language, 150-160 characters
- **Keywords**: 3-5 terms separated by commas
- **First paragraph**: Use main keyword naturally

Example:
```
title: How to Find Warehouse Space in Palm Beach County
slug: find-warehouse-space-palm-beach
description: Complete guide to finding warehouse and industrial space for contractors in Palm Beach County. Learn neighborhoods, pricing, and negotiation tactics.
keywords: warehouse space, Palm Beach, contractor, industrial, real estate
```

## Markdown Cheatsheet

| Element | Syntax |
|---------|--------|
| Bold | `**bold**` |
| Italic | `*italic*` |
| Link | `[text](url)` |
| Heading 2 | `## Title` |
| Heading 3 | `### Title` |
| List | `- item` |
| Numbered | `1. item` |
| Code | ` ```code``` ` |
| Quote | `> quoted` |
| Table | See template above |

## Pillar Tracking

Articles with the same pillar are shown as "Related Articles" in the sidebar. Group related content:

- **Warehouse Guides**: How-to guides for finding/securing space
- **Market Trends**: Market analysis, price trends, demand
- **Contractor Tips**: Operational efficiency, best practices
- **Legal/Compliance**: Zoning, permits, contracts
- **Financing**: Funding options, ROI, cash flow
- **Location Guides**: Neighborhood profiles, area analysis

## Troubleshooting

**Article not appearing after build:**
- Check YAML syntax (no missing colons)
- Verify slug: no spaces, no special characters
- Ensure date format is YYYY-MM-DD
- Check for error message in console

**Wrong styling:**
- Don't use HTML tags (not supported)
- Use markdown syntax only
- Code blocks must use triple backticks ` ``` `

**Sitemap not updating:**
- Run: `npm run build:blog` (not `npm build`)
- Check console for success message
- Verify file was created in `blog-content/`

## File Locations

```
blog-content/
├── sample-post.md          ← Reference example
├── your-article.md         ← Add new articles here
└── another-article.md

blog/                        ← AUTO-GENERATED (don't edit)
├── index.html             ← Blog listing
└── your-article/
    └── index.html         ← Article page
```

## Publishing Workflow

1. Create markdown file in `blog-content/`
2. Verify all frontmatter fields
3. Write and format article
4. Run: `npm run build:blog`
5. Check console for "✨ Blog build complete!"
6. Verify article at `/blog/[slug]/`
7. Test on mobile
8. Commit changes to git
9. Deploy to production

---

**Questions?** See `BLOG_README.md` for full documentation.
