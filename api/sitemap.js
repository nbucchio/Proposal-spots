function toSlug(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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

      spotSlugs = allRecords
        .map(r => toSlug(r.fields.Name || r.fields.name || ''))
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.proposalspots.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.proposalspots.com/inspiration.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>${spotUrls}${storyUrls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(xml);
}
