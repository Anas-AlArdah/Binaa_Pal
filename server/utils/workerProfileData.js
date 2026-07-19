function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
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

  const image = normalizeText(source.image || source.imageUrl || source.url);

  if (!image) {
    return null;
  }

  const title = normalizeText(source.title) || `عمل ${index + 1}`;
  const description = normalizeText(source.description || source.caption);
  const tag = normalizeText(source.tag || source.category);

  return {
    id: normalizeText(source.id) || `portfolio-${index + 1}`,
    title,
    description,
    image,
    tag,
  };
}

function normalizePortfolioItems(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => normalizePortfolioItem(item, index))
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    const nestedItems = value.portfolio_items || value.items;
    return normalizePortfolioItems(nestedItems);
  }

  const textValue = normalizeText(value);

  if (!textValue) {
    return [];
  }

  const parsed = safeJsonParse(textValue);

  if (parsed) {
    return normalizePortfolioItems(parsed);
  }

  return textValue
    .split(',')
    .map((item, index) => normalizePortfolioItem(item, index))
    .filter(Boolean);
}

function serializePortfolioItems(value) {
  const items = normalizePortfolioItems(value);
  return items.length > 0 ? JSON.stringify(items) : null;
}

function getFirstPortfolioImage(value) {
  return normalizePortfolioItems(value)[0]?.image || null;
}

function getProfileImage(profile) {
  const explicitImage = normalizeText(profile?.profile_image);
  return explicitImage || getFirstPortfolioImage(profile?.p_images) || null;
}

module.exports = {
  getProfileImage,
  normalizePortfolioItems,
  serializePortfolioItems,
};
