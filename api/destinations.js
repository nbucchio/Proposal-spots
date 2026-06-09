export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache at the edge for 5 minutes; serve stale for up to 1h while revalidating
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=3600');

  const BASE  = 'appN5GFcdPJvU1qff';
  // Table ID from the user-provided Airtable URL — more stable than the table name.
  const TABLE = 'tblAfK8TLXBFdRY9z';
  const TOKEN = process.env.AIRTABLE_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN environment variable' });
  }

  try {
    let allRecords = [];
    let offset = null;

    do {
      const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?pageSize=100${offset ? '&offset=' + encodeURIComponent(offset) : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error('[destinations] Airtable error', response.status, errBody);
        return res.status(response.status).json({ error: errBody || response.statusText });
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    const optimizeCdn = (url, w) => {
      if (!url || !url.includes('airtableusercontent.com')) return url;
      return `/cdn-cgi/image/width=${w || 800},format=webp,quality=80/${url}`;
    };

    const firstAttachmentUrl = (val) => {
      if (!val) return '';
      if (Array.isArray(val) && val[0] && val[0].url) return val[0].url;
      if (typeof val === 'string') return val;
      return '';
    };

    const destinations = allRecords
      .map(r => {
        const f = r.fields || {};

        const urlImages = f.gallery_images
          ? f.gallery_images.split(/[\n,]/).map(u => u.trim()).filter(Boolean)
          : [];

        const attachmentImages = f.gallery_images_attachment
          ? f.gallery_images_attachment.map(a => a.url)
          : [];

        const galleryImages = [...urlImages, ...attachmentImages];

        return {
          id: r.id,
          destination_slug: (f.destination_slug || '').trim(),
          display_name:     f.display_name     || '',
          Continent:        f.Continent        || '',
          show_in_nav:      f.show_in_nav === true || f.show_in_nav === 1 || f.show_in_nav === 'true',
          nav_order:        typeof f.nav_order === 'number' ? f.nav_order : 9999,
          hero_video_url:   f.hero_video_url   || '',
          hero_image_fallback: firstAttachmentUrl(f.hero_image_fallback),
          portrait_hero:    optimizeCdn(firstAttachmentUrl(f['Portrait Heroes']) || firstAttachmentUrl(f.hero_image_fallback), 800),
          gallery_images:   galleryImages
        };
      })
      .filter(d => d.show_in_nav && d.destination_slug)
      .sort((a, b) => (a.nav_order - b.nav_order) || a.display_name.localeCompare(b.display_name));

    res.status(200).json({ destinations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
