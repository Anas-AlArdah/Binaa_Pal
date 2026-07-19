export function normalizePortfolioItems(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => normalizePortfolioItem(item, index))
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    return normalizePortfolioItems(value.portfolio_items || value.items);
  }

  const textValue = String(value).trim();

  if (!textValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(textValue);
    return normalizePortfolioItems(parsed);
  } catch (error) {
    return textValue
      .split(',')
      .map((item, index) => normalizePortfolioItem(item, index))
      .filter(Boolean);
  }
}

function normalizePortfolioItem(item, index) {
  const source =
    typeof item === 'string'
      ? { image: item }
      : item && typeof item === 'object'
        ? item
        : null;

  if (!source) {
    return null;
  }

  const image = String(source.image || source.imageUrl || source.url || '').trim();

  if (!image) {
    return null;
  }

  return {
    id: String(source.id || `portfolio-${index + 1}`),
    title: String(source.title || '').trim(),
    description: String(source.description || source.caption || '').trim(),
    tag: String(source.tag || source.category || '').trim(),
    image,
  };
}

export function getFirstPortfolioImage(value) {
  return normalizePortfolioItems(value)[0]?.image || null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('تعذر قراءة الملف المحدد.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('تعذر تجهيز الصورة.'));
    image.src = source;
  });
}

export async function prepareImageFile(
  file,
  { maxWidth = 1400, maxHeight = 1400, quality = 0.84 } = {}
) {
  if (!file) {
    return '';
  }

  if (file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return dataUrl;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const outputType = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
  return canvas.toDataURL(outputType, quality);
}
