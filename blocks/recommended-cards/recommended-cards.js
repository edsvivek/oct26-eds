const getCell = (row, index) => row.children[index] || null;

const getText = (cell) => cell?.textContent.trim() || '';

const getString = (value) => (typeof value === 'string' ? value.trim() : '');

const getJsonSource = (block) => {
  const cells = [...block.children].flatMap((row) => (
    [...row.children].map((cell) => ({ cell, row }))
  ));
  const match = cells.find(({ cell }) => {
    const link = cell.querySelector('a[href]');
    return [link?.href, getText(cell)].filter(Boolean).some((candidate) => {
      try {
        return new URL(candidate, document.baseURI).pathname.toLowerCase().endsWith('.json');
      } catch {
        return false;
      }
    });
  });

  if (!match) return { url: '', row: null };
  const link = match.cell.querySelector('a[href]');
  const source = [link?.href, getText(match.cell)].filter(Boolean).find((candidate) => {
    try {
      return new URL(candidate, document.baseURI).pathname.toLowerCase().endsWith('.json');
    } catch {
      return false;
    }
  });
  return { url: new URL(source, document.baseURI).href, row: match.row };
};

const resolveImagePath = (imagePath, source) => {
  if (!getString(imagePath)) return '';
  try {
    return new URL(imagePath.trim(), source).href;
  } catch {
    return '';
  }
};

const getAuthoredLink = (cell) => {
  const authoredLink = cell?.querySelector('a');
  const href = authoredLink?.getAttribute('href')?.trim();
  const label = authoredLink?.textContent.trim();
  if (!href || href === '#' || !label) return null;

  try {
    const { protocol } = new URL(href, document.baseURI);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) return null;
  } catch {
    return null;
  }

  return { href, label };
};

const createAuthoredLink = (cell, className) => {
  const linkDetails = getAuthoredLink(cell);
  if (!linkDetails) return null;

  const link = document.createElement('a');
  link.className = className;
  link.href = linkDetails.href;
  link.textContent = linkDetails.label;
  return link;
};

const createHeader = (row, headingId) => {
  const cells = [...row.children];
  const header = document.createElement('div');
  header.className = 'recommended-cards-header';

  const titleCell = cells[0];
  const paragraphs = [...(titleCell?.querySelectorAll('p') || [])]
    .map((paragraph) => paragraph.textContent.trim())
    .filter(Boolean);
  const cellLines = titleCell?.innerText || getText(titleCell);
  const textLines = cellLines.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const titleText = paragraphs.length > 1
    ? paragraphs[0]
    : textLines[0] || paragraphs[0] || getText(titleCell);
  const supportingText = paragraphs.length > 1
    ? paragraphs.slice(1).join(' ')
    : textLines.slice(1).join(' ');

  if (titleText) {
    const title = document.createElement('h2');
    title.id = headingId;
    title.className = 'recommended-cards-heading';
    title.textContent = titleText;
    header.append(title);
  }

  if (supportingText) {
    const subtitle = document.createElement('p');
    subtitle.className = 'recommended-cards-subtitle';
    subtitle.textContent = supportingText;
    header.append(subtitle);
  }

  const viewAllCell = cells[1];
  const viewAll = createAuthoredLink(viewAllCell, 'recommended-cards-view-all');
  if (viewAll) {
    header.append(viewAll);
  } else if (getText(viewAllCell)) {
    const label = document.createElement('span');
    label.className = 'recommended-cards-view-all';
    label.textContent = getText(viewAllCell);
    header.append(label);
  }
  return header;
};

const createMedia = (cardData, source) => {
  const media = document.createElement('div');
  media.className = 'recommended-cards-media';

  const imagePath = resolveImagePath(cardData.image, source);
  if (imagePath) {
    const image = document.createElement('img');
    image.src = imagePath;
    image.alt = cardData.discounttext || cardData.category || '';
    image.loading = 'lazy';
    media.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'recommended-cards-image-placeholder';
    placeholder.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>';
    media.append(placeholder);
  }

  const badgeText = getString(cardData.imagetext);
  if (badgeText) {
    const badge = document.createElement('span');
    badge.className = 'recommended-cards-badge';
    badge.textContent = badgeText;
    media.append(badge);
  }

  const favorite = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'recommended-cards-favorite';
  const startsFavorite = cardData.favorite === true || cardData.isFavorite === true;
  favorite.setAttribute('aria-label', startsFavorite ? 'Remove from favorites' : 'Add to favorites');
  favorite.setAttribute('aria-pressed', String(startsFavorite));
  favorite.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>';
  favorite.addEventListener('click', () => {
    const isFavorite = favorite.getAttribute('aria-pressed') === 'true';
    favorite.setAttribute('aria-pressed', String(!isFavorite));
    favorite.setAttribute('aria-label', isFavorite ? 'Add to favorites' : 'Remove from favorites');
  });
  media.append(favorite);

  return media;
};

const createCard = (cardData, source) => {
  const categoryText = getString(cardData.category);
  const titleText = getString(cardData.discounttext);
  const descriptionText = getString(cardData.description);
  const buttonText = getString(cardData.buttontext);
  let button = null;
  if (buttonText && getString(cardData.buttonlink)) {
    try {
      const href = getString(cardData.buttonlink);
      const { protocol } = new URL(href, document.baseURI);
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) {
        const link = document.createElement('a');
        link.className = 'recommended-cards-cta';
        link.href = href;
        link.textContent = buttonText;
        button = link;
      }
    } catch {
      button = null;
    }
  }

  if (buttonText && !button) {
    button = document.createElement('span');
    button.className = 'recommended-cards-cta';
    button.textContent = buttonText;
  }

  const listItem = document.createElement('li');
  listItem.className = 'recommended-cards-item';
  const card = document.createElement('article');
  card.className = 'recommended-cards-card';

  const media = createMedia(cardData, source);

  const body = document.createElement('div');
  body.className = 'recommended-cards-body';

  if (categoryText) {
    const category = document.createElement('span');
    category.className = 'recommended-cards-category';
    category.textContent = categoryText;
    body.append(category);
  }

  if (titleText) {
    const title = document.createElement('h3');
    title.className = 'recommended-cards-card-title';
    title.textContent = titleText;
    body.append(title);
  }

  if (descriptionText) {
    const description = document.createElement('p');
    description.className = 'recommended-cards-description';
    description.textContent = descriptionText;
    body.append(description);
  }

  if (button) body.append(button);
  card.append(media, body);
  listItem.append(card);
  return listItem;
};

const getPageStarts = (track, cards) => {
  if (!cards.length || !track.clientWidth) return [0];

  const firstCard = cards[0];
  const styles = window.getComputedStyle(track);
  const gap = Number.parseFloat(styles.columnGap) || 0;
  const cardWidth = firstCard.getBoundingClientRect().width;
  const cardsPerPage = Math.max(1, Math.floor((track.clientWidth + gap) / (cardWidth + gap)));
  const lastStart = Math.max(0, cards.length - cardsPerPage);
  const starts = [];

  for (let start = 0; start < lastStart; start += cardsPerPage) starts.push(start);
  if (starts[starts.length - 1] !== lastStart) starts.push(lastStart);
  return starts;
};

const getCardOffset = (track, card) => card.getBoundingClientRect().left
  - track.getBoundingClientRect().left + track.scrollLeft;

const updatePagination = (track, cards, pagination) => {
  const starts = getPageStarts(track, cards);
  pagination.replaceChildren();
  if (starts.length <= 1) return starts;

  starts.forEach((start, pageIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'recommended-cards-dot';
    dot.setAttribute('aria-label', `Show cards starting at ${start + 1}`);
    dot.addEventListener('click', () => {
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      track.scrollTo({ left: getCardOffset(track, cards[start]), behavior });
    });
    pagination.append(dot);
    if (pageIndex === 0) dot.setAttribute('aria-current', 'page');
  });

  return starts;
};

const decorateCarousel = (track, cards, pagination) => {
  let starts = updatePagination(track, cards, pagination);
  let scrollFrame = 0;

  const syncActiveDot = () => {
    scrollFrame = 0;
    if (pagination.children.length <= 1) return;

    const currentOffset = track.scrollLeft;
    let activeIndex = 0;
    starts.forEach((start, index) => {
      if (getCardOffset(track, cards[start]) <= currentOffset + 2) activeIndex = index;
    });

    [...pagination.children].forEach((dot, index) => {
      if (index === activeIndex) dot.setAttribute('aria-current', 'page');
      else dot.removeAttribute('aria-current');
    });
  };

  track.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncActiveDot);
  }, { passive: true });

  const refresh = () => {
    starts = updatePagination(track, cards, pagination);
    syncActiveDot();
  };

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(refresh);
    observer.observe(track);
    if (cards[0]) observer.observe(cards[0]);
  } else {
    window.addEventListener('resize', refresh);
  }
};

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const firstRowLabel = getText(getCell(rows[0], 0)).toLowerCase().replace(/[^a-z0-9]/g, '');
  const hasBlockNameRow = ['recommendedcards', 'recommendedcardsblock'].includes(firstRowLabel);
  const jsonSource = getJsonSource(block);
  const contentRows = rows.filter((row, index) => (
    (!hasBlockNameRow || index > 0) && row !== jsonSource.row
  ));
  const source = jsonSource.url;
  if (!source) {
    block.replaceChildren();
    block.textContent = 'Recommended offers are temporarily unavailable.';
    return;
  }

  block.replaceChildren();
  let json;
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Recommended cards request failed: ${response.status}`);
    json = await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to load recommended cards:', error);
    block.textContent = 'Recommended offers are temporarily unavailable.';
    return;
  }

  const data = Array.isArray(json?.data) ? json.data.filter((cardData) => (
    cardData && typeof cardData === 'object' && !Array.isArray(cardData)
  )) : [];
  if (!data.length) {
    block.textContent = 'No recommended offers are available.';
    return;
  }

  const headingId = `recommended-cards-heading-${Math.random().toString(36).slice(2, 9)}`;
  const headingRow = contentRows[0];
  const header = headingRow ? createHeader(headingRow, headingId) : document.createElement('div');
  const cards = data.map((cardData) => createCard(cardData, source));

  if (header.childElementCount) block.append(header);

  const carousel = document.createElement('div');
  carousel.className = 'recommended-cards-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  if (headingRow?.children[0]?.textContent.trim()) {
    carousel.setAttribute('aria-labelledby', headingId);
  } else {
    carousel.setAttribute('aria-label', 'Recommended cards');
  }

  const track = document.createElement('ul');
  track.className = 'recommended-cards-track';
  cards.forEach((card) => track.append(card));
  carousel.append(track);

  const pagination = document.createElement('div');
  pagination.className = 'recommended-cards-pagination';
  pagination.setAttribute('role', 'group');
  pagination.setAttribute('aria-label', 'Carousel pages');
  carousel.append(pagination);
  block.append(carousel);

  if (cards.length) decorateCarousel(track, cards, pagination);
}
