function optimizeAirtableImage(url, width) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('airtableusercontent.com')) return url;
  return '/cdn-cgi/image/width=' + (width || 800) + ',format=webp,quality=80/' + url;
}
