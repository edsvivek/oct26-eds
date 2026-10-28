const getText = (cell) => cell?.textContent?.trim() || '';

const getJsonSource = (block) => {
  const link = [...block.querySelectorAll('a[href]')].find((anchor) => {
    const href = anchor.getAttribute('href') || '';
    try {
      return new URL(href, document.baseURI).pathname.toLowerCase().endsWith('.json');
    } catch {
      return false;
    }
  });

  if (link) {
    return new URL(link.getAttribute('href'), document.baseURI).href;
  }

  return '/benefits.json';
};

const createCard = (benefit) => {
  const article = document.createElement('article');
  article.className = 'benefit-card';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'benefit-card-icon';
  const icon = document.createElement('span');
  icon.textContent = benefit.icon || '✓';
  iconWrap.append(icon);

  const body = document.createElement('div');
  body.className = 'benefit-card-body';

  const title = document.createElement('h3');
  title.textContent = benefit.title || 'Benefit';
  body.append(title);

  if (benefit.description) {
    const description = document.createElement('p');
    description.textContent = benefit.description;
    body.append(description);
  }

  if (benefit.link && benefit.linktext) {
    const link = document.createElement('a');
    link.className = 'benefit-card-link';
    link.href = benefit.link;
    link.textContent = benefit.linktext;
    body.append(link);
  }

  article.append(iconWrap, body);
  return article;
};

export default async function decorate(block) {
  const source = getJsonSource(block);
  block.textContent = '';

  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Benefit cards request failed: ${response.status}`);
    }

    const json = await response.json();
    const benefits = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.items)
          ? json.items
          : [];

    if (!benefits.length) {
      block.textContent = 'No benefits are available.';
      return;
    }

    const cards = document.createElement('div');
    cards.className = 'benefit-cards';

    benefits
      .filter((benefit) => benefit && typeof benefit === 'object')
      .forEach((benefit) => cards.append(createCard(benefit)));

    block.append(cards);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to load benefit cards:', error);
    block.textContent = 'Benefit information is temporarily unavailable.';
  }
}
