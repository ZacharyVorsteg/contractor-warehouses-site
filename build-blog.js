#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const yaml = require('js-yaml');

// Configuration
const CONTENT_DIR = path.join(__dirname, 'blog-content');
const OUTPUT_DIR = path.join(__dirname, 'blog');
const TEMPLATE_FILE = path.join(__dirname, 'blog/_template.html');
const INDEX_TEMPLATE_FILE = path.join(__dirname, 'blog/_index-template.html');
const SITE_MAP = path.join(__dirname, 'sitemap.xml');

// Utility: Parse YAML frontmatter
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
        throw new Error('Invalid frontmatter format');
    }
    const frontmatter = yaml.load(match[1]);
    const markdown = match[2];
    return { frontmatter, markdown };
}

// Utility: Calculate read time (words / 200 = minutes)
function calculateReadTime(content) {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
}

// Utility: Normalise any frontmatter date to a plain YYYY-MM-DD string.
// js-yaml parses an unquoted `date: 2026-03-22` into a JS Date, which used to be
// stringified into schema.org as "Sun Mar 22 2026 00:00:00 GMT+0000 (...)" (invalid ISO 8601).
function toISODate(value) {
    if (value instanceof Date && !isNaN(value)) {
        // YAML dates are parsed as UTC midnight; read the UTC parts so the calendar day is preserved.
        const y = value.getUTCFullYear();
        const m = String(value.getUTCMonth() + 1).padStart(2, '0');
        const d = String(value.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    const str = String(value || '').trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const parsed = new Date(str);
    if (!isNaN(parsed)) return parsed.toISOString().split('T')[0];
    return '';
}

// Utility: Format YYYY-MM-DD to human-readable without UTC off-by-one
function formatDate(isoDate) {
    // Anchor at local noon so the calendar day never shifts backwards in US time zones.
    const date = new Date(`${isoDate}T12:00:00`);
    if (isNaN(date)) return String(isoDate);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility: neutralise straight double quotes so titles/descriptions stay valid
// inside HTML attributes and inside the JSON-LD block.
function safeText(value) {
    return String(value == null ? '' : value).replace(/"/g, '\u201d').replace(/</g, '\u2039');
}

// Utility: Slugify string
function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Utility: Generate RSS 2.0 feed
function generateRssFeed(articles) {
    const baseUrl = 'https://warehousesforcontractors.com';
    const now = new Date().toUTCString();

    const items = articles.map(article => `
    <item>
        <title>${safeText(article.title)}</title>
        <link>${baseUrl}/blog/${article.slug}/</link>
        <guid>${baseUrl}/blog/${article.slug}/</guid>
        <pubDate>${new Date(article.date).toUTCString()}</pubDate>
        <description>${safeText(article.description)}</description>
        <category>${safeText(article.pillar)}</category>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Warehouse for Contractors Blog</title>
        <link>${baseUrl}/blog/</link>
        <description>Expert warehouse and industrial real estate tips for contractors in Palm Beach County.</description>
        <language>en-us</language>
        <lastBuildDate>${now}</lastBuildDate>
        ${items}
    </channel>
</rss>`;

    return rss;
}

// Main: Build blog articles
async function buildBlog() {
    console.log('🚀 Starting blog build...');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read template
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
    const indexTemplate = fs.readFileSync(INDEX_TEMPLATE_FILE, 'utf-8');

    // Get all markdown files
    const mdFiles = fs.readdirSync(CONTENT_DIR)
        .filter(f => f.endsWith('.md'))
        .filter(f => !f.startsWith('_') && !f.startsWith('.') && !/(^|[-.])draft([-.]|$)/i.test(f));

    if (mdFiles.length === 0) {
        console.log('⚠️  No markdown files found in blog-content/');
        return;
    }

    const articles = [];

    // Pass 1: parse every post (no rendering yet) so ordering and related links are deterministic
    for (const file of mdFiles) {
        const filePath = path.join(CONTENT_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        try {
            const { frontmatter, markdown } = parseFrontmatter(content);

            // Validate required fields
            if (!frontmatter.title || !frontmatter.slug || !frontmatter.description) {
                console.error(`❌ Missing required fields in ${file}`);
                continue;
            }

            if (frontmatter.draft === true || frontmatter.published === false) {
                console.log(`⏭️  Skipping draft: ${file}`);
                continue;
            }

            const isoDate = toISODate(frontmatter.date);
            if (!isoDate) {
                console.error(`❌ Invalid or missing date in ${file}`);
                continue;
            }

            // Parse markdown to HTML
            let htmlContent = marked(markdown);
            htmlContent = htmlContent.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/i, ''); // template renders the title; never print the body H1 twice
            // Wrap tables in scrollable container for mobile
            htmlContent = htmlContent.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');

            articles.push({
                file: file,
                title: safeText(frontmatter.title),
                titleSEO: safeText(frontmatter.seo_title || frontmatter.title),
                slug: String(frontmatter.slug).trim(),
                description: safeText(frontmatter.seo_description || frontmatter.description),
                author: safeText(frontmatter.author || 'Zachary Vorsteg'),
                date: isoDate,
                dateFormatted: formatDate(isoDate),
                keywords: safeText(frontmatter.keywords || ''),
                pillar: safeText(frontmatter.pillar || 'General'),
                readTime: calculateReadTime(markdown),
                content: htmlContent
            });
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }

    if (articles.length === 0) {
        console.log('⚠️  No publishable posts found — leaving existing blog output untouched.');
        return [];
    }

    // Newest first by frontmatter date (ties broken by slug so the order is stable)
    articles.sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));

    // Pass 2: render each article page against the full, sorted set
    for (const article of articles) {
        const articleDir = path.join(OUTPUT_DIR, article.slug);
        if (!fs.existsSync(articleDir)) {
            fs.mkdirSync(articleDir, { recursive: true });
        }

        // Related: same pillar first, then most recent others, never itself
        const samePillar = articles.filter(a => a.slug !== article.slug && a.pillar === article.pillar);
        const otherPosts = articles.filter(a => a.slug !== article.slug && a.pillar !== article.pillar);
        const related = [...samePillar, ...otherPosts].slice(0, 3);

        let relatedHtml = '';
        if (related.length > 0) {
            relatedHtml = `
                <div class="sidebar-box">
                    <h3>Related Articles</h3>
                    <ul>
                        ${related.map(r => `<li><a href="/blog/${r.slug}/">${r.title}</a></li>`).join('')}
                    </ul>
                </div>
                `;
        }

        const articleHtml = template
            .replace(/{{TITLE_SEO}}/g, article.titleSEO)
            .replace(/{{TITLE}}/g, article.title)
            .replace(/{{DESCRIPTION}}/g, article.description)
            .replace(/{{KEYWORDS}}/g, article.keywords)
            .replace(/{{SLUG}}/g, article.slug)
            .replace(/{{AUTHOR}}/g, article.author)
            .replace(/{{DATE}}/g, article.date)
            .replace(/{{DATE_FORMATTED}}/g, article.dateFormatted)
            .replace(/{{CONTENT}}/g, article.content)
            .replace(/{{PILLAR}}/g, article.pillar)
            .replace(/{{READ_TIME}}/g, article.readTime)
            .replace(/{{RELATED_ARTICLES}}/g, relatedHtml);

        fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml);
        console.log(`✅ Generated: /blog/${article.slug}/ (${article.date})`);
    }

    // Generate blog index page (already sorted newest-first)
    const articleCards = articles.map(article => `
        <article class="article-card">
            <div class="article-image">${article.pillar}</div>
            <div class="article-card-content">
                <span class="article-tag">${article.pillar}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="article-meta">
                    <span>📅 <time datetime="${article.date}">${article.dateFormatted}</time></span>
                    <span>⏱️ ${article.readTime} min</span>
                </div>
                <a href="/blog/${article.slug}/" class="article-link">Read More →</a>
            </div>
        </article>
    `).join('');

    const indexHtml = indexTemplate
        .replace(/{{ARTICLE_CARDS}}/g, articleCards)
        .replace(/{{ARTICLE_COUNT}}/g, articles.length)
        .replace(/{{ARTICLE_PLURAL}}/g, articles.length === 1 ? '' : 's');

    const indexPath = path.join(OUTPUT_DIR, 'index.html');
    fs.writeFileSync(indexPath, indexHtml);
    console.log(`✅ Generated: /blog/`);

    // Generate RSS feed
    const rssFeed = generateRssFeed(articles);
    const rssPath = path.join(OUTPUT_DIR, 'feed.xml');
    fs.writeFileSync(rssPath, rssFeed);
    console.log(`✅ Generated: /blog/feed.xml`);

    // Update sitemap
    updateSitemap(articles);

    console.log(`\n✨ Blog build complete! ${articles.length} article(s) generated.`);
    return articles;
}

// Utility: Update sitemap
function updateSitemap(articles) {
    const baseUrl = 'https://warehousesforcontractors.com';
    const today = new Date().toISOString().split('T')[0];

    // Normalise a URL so the same page cannot appear three times
    // (bare domain / trailing slash / index.html were all listed separately).
    function normalise(url) {
        let u = String(url).trim().replace(/\/index\.html$/i, '/');
        if (u === baseUrl) u = `${baseUrl}/`;
        return u;
    }

    // Carry over non-blog URLs from the existing sitemap
    let existingSitemapContent = '';
    if (fs.existsSync(SITE_MAP)) {
        existingSitemapContent = fs.readFileSync(SITE_MAP, 'utf-8');
    }

    const nonBlogUrls = [];
    const seen = new Set();
    function push(url) {
        const u = normalise(url);
        if (!u.startsWith(baseUrl) || seen.has(u)) return;
        seen.add(u);
        nonBlogUrls.push(u);
    }

    push(`${baseUrl}/`);

    if (existingSitemapContent) {
        const urlRegex = /<loc>([^<]+)<\/loc>/g;
        let match;
        while ((match = urlRegex.exec(existingSitemapContent))) {
            if (!match[1].includes('/blog/')) push(match[1]);
        }
    }

    push(`${baseUrl}/blog/`);

    const entries = nonBlogUrls.map(url => ({ loc: url, lastmod: today, priority: '1.0' }));

    // Blog articles: lastmod is the post's own date, not the build date
    for (const article of articles) {
        const loc = `${baseUrl}/blog/${article.slug}/`;
        if (seen.has(loc)) continue;
        seen.add(loc);
        entries.push({ loc, lastmod: article.date || today, priority: '0.8' });
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `    <url>
        <loc>${e.loc}</loc>
        <lastmod>${e.lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${e.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(SITE_MAP, sitemapXml);
    console.log(`✅ Updated sitemap: ${entries.length} URLs (${articles.length} blog articles)`);
}

// Run build
buildBlog().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
