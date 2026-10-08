export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const firstCells = [...rows[0].children];
  const hasHeader = firstCells.length === 1
    && !firstCells[0].querySelector('picture, img, a');
  const offerRows = hasHeader ? rows.slice(1) : rows;

  const grid = document.createElement('div');
  grid.className = 'recommended-grid';

  offerRows.forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const card = document.createElement('article');
    card.className = 'recommended-card';

    const imageCell = cells[0];
    const picture = imageCell?.querySelector('picture');
    const img = imageCell?.querySelector('img');

    const media = document.createElement('div');
    media.className = 'recommended-media';
    const placeholder = document.createElement('span');
    placeholder.className = 'recommended-media-placeholder';
    placeholder.textContent = String(index + 1).padStart(2, '0');
    placeholder.setAttribute('aria-hidden', 'true');

    if (picture) {
      const pictureClone = picture.cloneNode(true);
      const pictureImage = pictureClone.querySelector('img');
      if (pictureImage) {
        pictureImage.addEventListener('error', () => {
          media.replaceChildren(placeholder);
        }, { once: true });
      }
      media.append(pictureClone);
    } else if (img) {
      const imageClone = img.cloneNode(true);
      imageClone.addEventListener('error', () => {
        media.replaceChildren(placeholder);
      }, { once: true });
      media.append(imageClone);
    } else {
      media.append(placeholder);
    }

    const body = document.createElement('div');
    body.className = 'recommended-body';

    const textCell = cells[1];
    if (cells.length >= 5) {
      [
        ['recommended-card-title', cells[1]],
        ['recommended-card-description', cells[2]],
        ['recommended-card-value', cells[3]],
      ].forEach(([className, source]) => {
        if (!source) return;
        const item = document.createElement('div');
        item.className = className;
        item.textContent = source.textContent.trim();
        body.append(item);
      });
    } else if (textCell) {
      const paragraphs = [...textCell.querySelectorAll('p')]
        .filter((paragraph) => paragraph.textContent.trim());
      const classes = [
        'recommended-card-title',
        'recommended-card-description',
        'recommended-card-value',
      ];

      if (paragraphs.length) {
        paragraphs.forEach((paragraph, paragraphIndex) => {
          const item = paragraph.cloneNode(true);
          item.classList.add(classes[Math.min(paragraphIndex, classes.length - 1)]);
          body.append(item);
        });
      } else if (textCell.textContent.trim()) {
        const title = document.createElement('div');
        title.className = 'recommended-card-title';
        title.textContent = textCell.textContent.trim();
        body.append(title);
      }
    }

    const ctaCell = cells.length >= 5 ? cells[4] : cells[2] || cells[4] || cells[3];
    const ctaLink = ctaCell?.querySelector('a');
    const button = document.createElement('a');
    button.className = 'recommended-card-button';
    button.href = ctaLink ? ctaLink.href : '#';
    button.textContent = ctaLink?.textContent.trim()
      || ctaCell?.textContent.trim()
      || 'View Details';

    body.append(button);
    card.append(media, body);
    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
