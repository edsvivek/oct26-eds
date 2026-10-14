const fallbackIcons = [
  '/icons/projects-rocket.svg',
  '/icons/business-partners.svg',
  '/icons/client-support.svg',
  '/icons/awards-trophy.svg',
];

function getCellParagraphs(cell) {
  const paragraphs = [...cell.querySelectorAll('p')]
    .map((paragraph) => paragraph.textContent.trim())
    .filter(Boolean);
  if (paragraphs.length) return paragraphs;

  return cell.textContent.split('\n').map((text) => text.trim()).filter(Boolean);
}

function createIcon(cell, index) {
  const image = cell.querySelector('img');
  const picture = image?.closest('picture');
  const icon = image?.cloneNode(true) || document.createElement('img');
  icon.className = 'widgets-icon';
  icon.alt = '';
  icon.setAttribute('aria-hidden', 'true');
  icon.loading = 'lazy';

  const fallback = fallbackIcons[index % fallbackIcons.length];
  if (!icon.getAttribute('src')) icon.src = fallback;
  icon.addEventListener('error', () => {
    if (icon.getAttribute('src') !== fallback) icon.src = fallback;
  }, { once: true });

  if (picture) {
    const clonedPicture = picture.cloneNode(true);
    const clonedImage = clonedPicture.querySelector('img');
    if (clonedImage) {
      clonedImage.className = 'widgets-icon';
      clonedImage.alt = '';
      clonedImage.setAttribute('aria-hidden', 'true');
      clonedPicture.querySelectorAll('source').forEach((source) => source.remove());
      clonedImage.addEventListener('error', () => {
        clonedImage.src = fallback;
      }, { once: true });
    }
    return clonedPicture;
  }
  return icon;
}

function createStat(row, index) {
  const cells = [...row.children];
  if (cells.length < 2) return null;

  const card = document.createElement('article');
  card.className = 'widgets-stat';

  const iconContainer = document.createElement('div');
  iconContainer.className = 'widgets-stat-icon';
  iconContainer.append(createIcon(cells[0], index));

  const [number = '', ...labelParts] = getCellParagraphs(cells[1]);
  const numberElement = document.createElement('div');
  numberElement.className = 'widgets-stat-number';
  numberElement.textContent = number;

  const label = document.createElement('div');
  label.className = 'widgets-stat-label';
  label.textContent = labelParts.join(' ');

  card.append(iconContainer, numberElement, label);
  return card;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  let statRows = rows;
  const firstCells = [...rows[0].children];
  if (firstCells.length === 1 && firstCells[0].textContent.trim()) {
    statRows = rows.slice(1);
  }

  const grid = document.createElement('div');
  grid.className = 'widgets-grid';
  statRows.forEach((row, index) => {
    const stat = createStat(row, index);
    if (stat) grid.append(stat);
  });

  block.replaceChildren(grid);
}
