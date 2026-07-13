const imagePreloads = new Map();

export function preloadImage(src, priority = "high") {
  if (!src) return Promise.resolve(false);
  if (imagePreloads.has(src)) return imagePreloads.get(src);

  const promise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = priority;
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
  imagePreloads.set(src, promise);
  return promise;
}
