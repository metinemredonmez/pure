/**
 * Seed script — extracts static page HTML content from web frontend files
 * and writes them to the backend Page model. Run once to migrate hardcoded
 * page content into the admin-manageable CMS.
 *
 * Usage (from backend dir):
 *   npx ts-node scripts/seed-pages-from-web.ts
 *
 * Subsequent edits are done via Admin > Web Sitesi > Sayfalar UI.
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Configured source of truth — web repo path
const WEB_DIR = path.resolve(__dirname, '../../web/src/app/(shop)/(other-pages)');

/**
 * Extract HTML content from a web page .tsx file.
 * Looks for JSX inside <article>...</article> which is the common pattern
 * across all static pages.
 */
function extractArticleHtml(tsx: string): string | null {
  // Match everything inside the first <article ... > ... </article>
  const match = tsx.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (!match) return null;
  let inner = match[1];

  // Strip leading/trailing whitespace
  inner = inner.trim();

  // Convert JSX className="..." → class="..."
  inner = inner.replace(/className=/g, 'class=');

  // Convert JSX {' '} / {\` \`} spacers to plain space
  inner = inner.replace(/\{\s*['"`] ['"`]\s*\}/g, ' ');
  inner = inner.replace(/\{[`'"]\s*[`'"]\}/g, ' ');

  // Remove JSX HTML entity escapes like &quot;
  inner = inner.replace(/&quot;/g, '"');
  inner = inner.replace(/&amp;/g, '&');
  inner = inner.replace(/&apos;/g, "'");

  // Remove any remaining JSX expressions {xxx} that weren't string literals
  // (safe for pure HTML pages — they don't have dynamic expressions)
  inner = inner.replace(/\{[^{}]*\}/g, '');

  return inner;
}

/**
 * Extract metadata title and description from `export const metadata = {...}` block.
 */
function extractMeta(tsx: string): { title?: string; description?: string } {
  const meta: { title?: string; description?: string } = {};
  const titleMatch = tsx.match(/title:\s*['"]([^'"]+)['"]/);
  if (titleMatch) meta.title = titleMatch[1];
  const descMatch = tsx.match(/description:\s*['"]([^'"]+)['"]/);
  if (descMatch) meta.description = descMatch[1];
  return meta;
}

/**
 * Extract the hero h1 heading from <h1 ...>...</h1> (if any).
 */
function extractH1(tsx: string): string | null {
  const match = tsx.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/);
  return match ? match[1].trim() : null;
}

// Page slugs to migrate — keep in sync with Sayfalar admin list
const PAGES = [
  'gizlilik-politikasi',
  'kvkk',
  'cerez-politikasi',
  'mesafeli-satis',
  'kullanim-kosullari',
  'iade-degisim',
  'odeme-teslimat',
  'siparis-takibi',
  'sss',
  'demleme-rehberi',
  'kahve-okulu',
  'kahve-sozlugu',
  'menseiler',
  'kampanyalar',
  'kurumsal-hediye',
  'toptan-satis',
  'ekipmanlar',
];

async function seed() {
  let ok = 0;
  let skipped = 0;

  for (const slug of PAGES) {
    const file = path.join(WEB_DIR, slug, 'page.tsx');
    if (!fs.existsSync(file)) {
      console.log(`⊘ ${slug} — no page.tsx, skip`);
      skipped++;
      continue;
    }

    const tsx = fs.readFileSync(file, 'utf-8');
    const html = extractArticleHtml(tsx);
    const meta = extractMeta(tsx);
    const h1 = extractH1(tsx);

    if (!html) {
      console.log(`⊘ ${slug} — no <article> found, skip`);
      skipped++;
      continue;
    }

    const title = h1 || meta.title || slug;
    const seoTitle = meta.title || title;
    const seoDescription = meta.description || '';

    await prisma.page.upsert({
      where: { slug },
      create: {
        slug,
        title,
        sections: [{ type: 'html', content: html }],
        isPublished: true,
        seoTitle,
        seoDescription,
      },
      update: {
        title,
        sections: [{ type: 'html', content: html }],
        seoTitle,
        seoDescription,
      },
    });

    console.log(`✓ ${slug} (${html.length} chars)`);
    ok++;
  }

  console.log(`\nDone: ${ok} seeded, ${skipped} skipped.`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
