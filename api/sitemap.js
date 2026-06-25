function toSlug(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const BLOG_SLUGS = [
  'how-to-plan-a-proposal', 'beach-wedding-proposal', 'beach-proposal-packages',
  'proposal-set-up', 'picnic-proposal', 'romantic-dinner-proposal',
  'romantic-proposal-ideas', 'proposal-packages', 'destination-engagement-photographer',
  'best-destinations-to-propose', 'proposal-planner', 'outdoor-proposal-ideas',
  'girlfriend-proposal', 'helicopter-proposal', 'engagement-planning',
  'unique-proposal-ideas', 'surprise-proposal-planning', 'engagement-photo-locations',
  'beach-proposal', 'best-places-to-propose-in-europe', 'marry-me-proposal',
  'private-engagement-proposal-ideas'
];

const STORY_SLUGS = [
  'amalfi', 'bali-rice', 'maldives', 'santorini', 'costa-rica', 'tulum',
  'algarve', 'provence', 'switzerland', 'nicaragua', 'costa-rica-waterfall',
  'maldives-overwater', 'santorini-caldera', 'portugal-cliffs', 'australia-coast',
  'swiss-bridge', 'dolomites', 'bali-temple', 'tulum-jungle', 'nicaragua-beach'
];

export default async function handler(req, res) {
  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'tblgpEUkpph612Hw5';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  let spotSlugs = [];

  if (TOKEN) {
    try {
      const formula = encodeURIComponent(`{Status}="Published"`);
      let allRecords = [];
      let offset = null;

      do {
        const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?filterByFormula=${formula}&pageSize=100${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        if (!response.ok) break;
        const data = await response.json();
        allRecords = allRecords.concat(data.records || []);
        offset = data.offset || null;
      } while (offset);

      // Prefer the Airtable "Slug" field; fall back to a slug generated from
      // the spot Name so spots with a blank Slug field still get listed.
      spotSlugs = allRecords
        .map(r => {
          const f = r.fields;
          return toSlug(f.Slug || '') || toSlug(f.Name || f.name || '');
        })
        .filter(Boolean);
    } catch (e) {
      // fall through with empty spotSlugs
    }
  }

  const spotUrls = spotSlugs.map(slug => `
  <url>
    <loc>https://www.proposalspots.com/spots/${slug}</loc>
    <priority>0.8</priority>
  </url>`).join('');

  const storyUrls = STORY_SLUGS.map(slug => `
  <url>
    <loc>https://www.proposalspots.com/stories/${slug}</loc>
    <priority>0.6</priority>
  </url>`).join('');

  const destinationUrls = [
    'amalfi-coast', 'greece', 'bali', 'tulum', 'maldives', 'switzerland',
    'costa-rica', 'nicaragua', 'portugal', 'south-of-france', 'united-states',
    'italy', 'hawaii', 'london', 'paris', 'patagonia'
  ].map(slug => `
  <url>
    <loc>https://www.proposalspots.com/destinations/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const budgetUrls = [
    'algarve', 'amalfi-coast', 'bali', 'costa-rica', 'maldives', 'new-york',
    'nicaragua', 'patagonia', 'santorini', 'south-of-france', 'switzerland', 'tulum'
  ].map(slug => `
  <url>
    <loc>https://www.proposalspots.com/budget/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const blogUrls = BLOG_SLUGS.map(slug => `
  <url>
    <loc>https://www.proposalspots.com/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.proposalspots.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.proposalspots.com/destinations</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>${destinationUrls}${blogUrls}
  <url>
    <loc>https://www.proposalspots.com/inspiration</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.proposalspots.com/how-it-works</loc>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.proposalspots.com/checklist</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.proposalspots.com/budget</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>${budgetUrls}
  <url>
    <loc>https://www.proposalspots.com/privacy-policy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.1</priority>
  </url>${spotUrls}${storyUrls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
