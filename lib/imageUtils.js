function optimizeAirtableImage(url) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('airtableusercontent.com')) return url;
  console.log('[imageUtils] optimizing:', url.slice(0, 80));
  return '/cdn-cgi/image/width=800,format=webp,quality=80/' + url;
}
