/**
 * Sitemap Generator Script for AniFlow
 * 
 * This script generates a comprehensive sitemap.xml by fetching 
 * popular anime and manga from the Jikan API.
 * 
 * Run with: npx ts-node scripts/generate-sitemap.ts
 * Or: npm run generate-sitemap (after adding script to package.json)
 */

const BASE_URL = 'https://aniflow.gyatbox.space'; // Update this to your actual domain
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

interface JikanItem {
    mal_id: number;
    title: string;
    title_english?: string;
}

interface ApiResponse {
    data: JikanItem[];
    pagination?: {
        has_next_page: boolean;
    };
}

/**
 * Converts a title to a URL-friendly slug
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 50);
}

/**
 * Delay function for rate limiting
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch data from Jikan API with retry logic
 */
async function fetchJikan(endpoint: string, retries = 3): Promise<ApiResponse> {
    const url = `${JIKAN_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                console.log(`Rate limited, waiting... (${retries} retries left)`);
                await delay(2000);
                return fetchJikan(endpoint, retries - 1);
            }
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (retries > 0) {
            await delay(1000);
            return fetchJikan(endpoint, retries - 1);
        }
        throw error;
    }
}

/**
 * Generate XML for a single URL entry
 */
function urlEntry(loc: string, priority: string, changefreq: string): string {
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap(): Promise<void> {
    console.log('🚀 Starting sitemap generation...\n');

    const urls: string[] = [];

    // Static pages
    const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/search', priority: '0.8', changefreq: 'daily' },
        { path: '/top', priority: '0.9', changefreq: 'weekly' },
        { path: '/seasonal', priority: '0.9', changefreq: 'weekly' },
        { path: '/recommendations', priority: '0.7', changefreq: 'weekly' },
        { path: '/anime', priority: '0.8', changefreq: 'daily' },
        { path: '/manga', priority: '0.8', changefreq: 'daily' },
        { path: '/characters', priority: '0.7', changefreq: 'weekly' },
        { path: '/random', priority: '0.5', changefreq: 'monthly' },
    ];

    staticPages.forEach(page => {
        urls.push(urlEntry(`${BASE_URL}${page.path}`, page.priority, page.changefreq));
    });

    console.log(`✅ Added ${staticPages.length} static pages`);

    // Fetch top anime (first 5 pages = 125 anime)
    console.log('\n📺 Fetching top anime...');
    for (let page = 1; page <= 5; page++) {
        try {
            const response = await fetchJikan(`/top/anime?page=${page}`);

            response.data.forEach(item => {
                const title = item.title_english || item.title;
                const slug = generateSlug(title);
                const url = `${BASE_URL}/anime/${slug}-${item.mal_id}`;
                urls.push(urlEntry(url, '0.7', 'weekly'));
            });

            console.log(`  Page ${page}: ${response.data.length} anime added`);

            // Rate limiting - Jikan allows 3 requests per second
            await delay(350);
        } catch (error) {
            console.error(`  Error on page ${page}:`, error);
        }
    }

    // Fetch seasonal anime
    console.log('\n🗓️ Fetching seasonal anime...');
    try {
        const response = await fetchJikan('/seasons/now?page=1');

        response.data.forEach(item => {
            const title = item.title_english || item.title;
            const slug = generateSlug(title);
            const url = `${BASE_URL}/anime/${slug}-${item.mal_id}`;
            // Check for duplicates
            const urlXml = urlEntry(url, '0.8', 'weekly');
            if (!urls.includes(urlXml)) {
                urls.push(urlXml);
            }
        });

        console.log(`  Added ${response.data.length} seasonal anime`);
        await delay(350);
    } catch (error) {
        console.error('  Error fetching seasonal:', error);
    }

    // Fetch top manga (first 3 pages = 75 manga)
    console.log('\n📚 Fetching top manga...');
    for (let page = 1; page <= 3; page++) {
        try {
            const response = await fetchJikan(`/top/manga?page=${page}`);

            response.data.forEach(item => {
                const title = item.title_english || item.title;
                const slug = generateSlug(title);
                const url = `${BASE_URL}/manga/${slug}-${item.mal_id}`;
                urls.push(urlEntry(url, '0.7', 'weekly'));
            });

            console.log(`  Page ${page}: ${response.data.length} manga added`);
            await delay(350);
        } catch (error) {
            console.error(`  Error on page ${page}:`, error);
        }
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    // Write to file
    const fs = await import('fs');
    const path = await import('path');

    const publicDir = path.join(process.cwd(), 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

    console.log(`\n✨ Sitemap generated successfully!`);
    console.log(`📍 Location: ${sitemapPath}`);
    console.log(`📊 Total URLs: ${urls.length}`);
}

// Run the generator
generateSitemap().catch(console.error);
