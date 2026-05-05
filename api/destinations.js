export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache at the edge for 5 minutes; serve stale for up to 1h while revalidating
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');

  const BASE  = 'appN5GFcdPJvU1qff';
  const TABLE = 'Destinations';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN environment variable' });
  }

  try {
    let allRecords = [];
    let offset = null;

    do {
      const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}?pageSize=100${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json(err);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    const firstAttachmentUrl = (val) => {
      if (!val) return '';
      if (Array.isArray(val) && val[0] && val[0].url) return val[0].url;
      if (typeof val === 'string') return val;
      return '';
    };

    const destinations = allRecords
      .map(r => {
        const f = r.fields || {};
        return {
          id: r.id,
          destination_slug: (f.destination_slug || '').trim(),
          display_name:     f.display_name     || '',
          Continent:        f.Continent        || '',
          show_in_nav:      f.show_in_nav === true,
          nav_order:        typeof f.nav_order === 'number' ? f.nav_order : 9999,
          hero_video_url:   f.hero_video_url   || '',
          hero_image_fallback: firstAttachmentUrl(f.hero_image_fallback)
        };
      })
      .filter(d => d.show_in_nav && d.destination_slug)
      .sort((a, b) => (a.nav_order - b.nav_order) || a.display_name.localeCompare(b.display_name));

    res.status(200).json({ destinations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
