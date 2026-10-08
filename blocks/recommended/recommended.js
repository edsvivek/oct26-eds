export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const firstRow = rows[0];
  const firstCells = [...firstRow.children];
  const titleText = firstCells.length === 1 ? firstCells[0].textContent.trim() : 'Recommended';

  const header = document.createElement('div');
  header.className = 'recommended-header';
  header.textContent = titleText || 'Recommended';

  const grid = document.createElement('div');
  grid.className = 'recommended-grid';

  rows.slice(1).forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const card = document.createElement('article');
    card.className = 'recommended-card';

    const imageCell = cells[0];
    const picture = imageCell?.querySelector('picture');
    const img = imageCell?.querySelector('img');

    const media = document.createElement('div');
    media.className = 'recommended-media';
    if (picture) {
      media.append(picture.cloneNode(true));
    } else if (img) {
      media.append(img.cloneNode(true));
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'recommended-media-placeholder';
      placeholder.textContent = 'Offer';
      media.append(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'recommended-body';

    const title = document.createElement('div');
    title.className = 'recommended-card-title';
    title.textContent = cells[1] ? cells[1].textContent.trim() : '';

    const description = document.createElement('div');
    description.className = 'recommended-card-description';
    description.textContent = cells[2] ? cells[2].textContent.trim() : '';

    const value = document.createElement('div');
    value.className = 'recommended-card-value';
    value.textContent = cells[3] ? cells[3].textContent.trim() : '';

    const ctaCell = cells[4] || cells[3];
    const ctaLink = ctaCell?.querySelector('a');
    const button = document.createElement('a');
    button.className = 'recommended-card-button';
    button.href = ctaLink ? ctaLink.href : '#';
    button.textContent = ctaCell ? ctaCell.textContent.trim() || 'View Details' : 'View Details';

    body.append(title, description, value, button);
    card.append(media, body);
    grid.append(card);
  });

  block.textContent = '';
  block.append(header, grid);
}
