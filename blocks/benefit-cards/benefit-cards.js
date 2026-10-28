function getIconPath(cell) {
  const image = cell.querySelector('img');
  if (image) return image.src;

  const link = cell.querySelector('a[href]');
  if (link) return link.href;

  const path = cell.textContent.trim();
  if (!path) return '';

  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('/')
    ? path
    : `/${path.replace(/^\.\//, '')}`;
}

export default function decorate(block) {
  const cards = [...block.children]
    .map((row) => {
      const cells = [...row.children];
      if (cells.length < 2) return null;

      const [iconCell, contentCell] = cells;
      const card = document.createElement('article');
      card.className = 'benefit-cards-card';

      const iconPath = getIconPath(iconCell);
      if (iconPath) {
        const icon = document.createElement('img');
        icon.className = 'benefit-cards-icon';
        icon.src = iconPath;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        card.append(icon);
      }

      const content = document.createElement('div');
      content.className = 'benefit-cards-content';
      content.append(...contentCell.childNodes);
      card.append(content);

      const destination = content.querySelector('a[href]');
      if (destination) {
        const arrowLink = document.createElement('a');
        arrowLink.className = 'benefit-cards-link';
        arrowLink.href = destination.href;
        arrowLink.setAttribute(
          'aria-label',
          `View ${content.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim() || 'benefit'}`,
        );
        card.append(arrowLink);
      }

      return card;
    })
    .filter(Boolean);

  const list = document.createElement('div');
  list.className = 'benefit-cards-list';
  list.append(...cards);
  block.replaceChildren(list);
}
