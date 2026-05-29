function optimizeAirtableImage(url) {
  if (!url || typeof url !== 'string') return url;
  // Cloudflare Image Resizing must be enabled on your Cloudflare plan before
  // activating the line below. Until then the function is a pass-through.
  // return '/cdn-cgi/image/width=800,format=webp,quality=80/' + url;
  return url;
}
