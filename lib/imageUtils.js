function optimizeAirtableImage(url, width) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('airtableusercontent.com')) return url;
  // On Vercel previews (non-prod hosts) use an absolute production URL so
  // images route through Cloudflare and render correctly on preview deployments.
  const onProd = /(^|\.)proposalspots\.com$/.test(location.hostname);
  const base = onProd ? '' : 'https://www.proposalspots.com';
  return base + '/cdn-cgi/image/width=' + (width || 800) + ',format=webp,quality=80/' + url;
}
