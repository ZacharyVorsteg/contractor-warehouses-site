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

// Utility: Format date to human-readable
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
    const mdFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) {
        console.log('⚠️  No markdown files found in blog-content/');
        return;
    }

    const articles = [];

    // Process each markdown file
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

            // Parse markdown to HTML
            let htmlContent = marked(markdown);
            // Wrap tables in scrollable container for mobile
            htmlContent = htmlContent.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');

            // Calculate metadata
            const readTime = calculateReadTime(markdown);
            const dateFormatted = formatDate(frontmatter.date);

            // Create article object
            const article = {
                title: frontmatter.title,
                slug: frontmatter.slug,
                description: frontmatter.description,
                author: frontmatter.author || 'Zachary Vorsteg',
                date: frontmatter.date,
                dateFormatted: dateFormatted,
                keywords: frontmatter.keywords || '',
                pillar: frontmatter.pillar || 'General',
                readTime: readTime,
                content: htmlContent
            };

            articles.push(article);

            // Generate article page
            const articleDir = path.join(OUTPUT_DIR, article.slug);
            if (!fs.existsSync(articleDir)) {
                fs.mkdirSync(articleDir, { recursive: true });
            }

            // Find related articles (same pillar, different articles)
            const related = articles
                .filter(a => a.pillar === article.pillar && a.slug !== article.slug)
                .slice(0, 3);

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

            // Replace placeholders in template
            let articleHtml = template
                .replace(/{{TITLE}}/g, article.title)
                .replace(/{{DESCRIPTION}}/g, article.description)
                .replace(/{{KEYWORDS}}/g, article.keywords)
                .replace(/{{SLUG}}/g, article.slug)
                .replace(/{{DATE}}/g, article.date)
                .replace(/{{DATE_FORMATTED}}/g, article.dateFormatted)
                .replace(/{{CONTENT}}/g, article.content)
                .replace(/{{PILLAR}}/g, article.pillar)
                .replace(/{{READ_TIME}}/g, article.readTime)
                .replace(/{{RELATED_ARTICLES}}/g, relatedHtml);

            // Write article HTML
            const articlePath = path.join(articleDir, 'index.html');
            fs.writeFileSync(articlePath, articleHtml);
            console.log(`✅ Generated: /blog/${article.slug}/`);

        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }

    // Generate blog index page
    const articleCards = articles.map(article => `
        <article class="article-card">
            <div class="article-image">${article.pillar}</div>
            <div class="article-card-content">
                <span class="article-tag">${article.pillar}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <div class="article-meta">
                    <span>📅 ${article.dateFormatted}</span>
                    <span>⏱️ ${article.readTime} min</span>
                </div>
                <a href="/blog/${article.slug}/" class="article-link">Read More →</a>
            </div>
        </article>
    `).join('');

    const indexHtml = indexTemplate
        .replace(/{{ARTICLE_CARDS}}/g, articleCards)
        .replace(/{{ARTICLE_COUNT}}/g, articles.length);

    const indexPath = path.join(OUTPUT_DIR, 'index.html');
    fs.writeFileSync(indexPath, indexHtml);
    console.log(`✅ Generated: /blog/`);

    // Update sitemap
    updateSitemap(articles);

    console.log(`\n✨ Blog build complete! ${articles.length} article(s) generated.`);
    return articles;
}

// Utility: Update sitemap
function updateSitemap(articles) {
    const baseUrl = 'https://warehousesforcontractors.com';

    // Read existing sitemap if it exists
    let existingSitemapContent = '';
    if (fs.existsSync(SITE_MAP)) {
        existingSitemapContent = fs.readFileSync(SITE_MAP, 'utf-8');
    }

    // Extract non-blog URLs from existing sitemap
    let nonBlogUrls = [];
    if (existingSitemapContent) {
        const urlRegex = /<loc>([^<]+)<\/loc>/g;
        let match;
        while ((match = urlRegex.exec(existingSitemapContent))) {
            const url = match[1];
            if (!url.includes('/blog/')) {
                nonBlogUrls.push(url);
            }
        }
    }

    // Ensure main domain and blog index are included
    if (!nonBlogUrls.includes(baseUrl)) {
        nonBlogUrls.unshift(baseUrl);
    }
    if (!nonBlogUrls.includes(`${baseUrl}/blog/`)) {
        nonBlogUrls.push(`${baseUrl}/blog/`);
    }

    // Generate blog article URLs
    const blogUrls = articles.map(article => `${baseUrl}/blog/${article.slug}/`);

    // Combine all URLs
    const allUrls = [...nonBlogUrls, ...blogUrls];

    // Build sitemap XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `    <url>
        <loc>${url}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${url.includes('/blog/') && url !== `${baseUrl}/blog/` ? '0.8' : '1.0'}</priority>
    </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(SITE_MAP, sitemapXml);
    console.log(`✅ Updated sitemap with ${articles.length} blog articles`);
}

// Run build
buildBlog().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
