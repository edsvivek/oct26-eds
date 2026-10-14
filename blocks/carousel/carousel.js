const slideImages = [
  'https://demo.themexbd.com/wpx/technowp/wp-content/uploads/2025/04/technowp-slider.jpg',
  'https://demo.themexbd.com/wpx/technowp/wp-content/uploads/2025/04/technowp-slider2.jpg',
];

const defaultTitle = 'Super IT Service For Digital Business';
const defaultDescription = 'Rorem ipsum dolor sit amet, consectetur adipisicing elit, eiusmod to incididunt ut labore et dolore magna aliqua. designing in a way of just not only professions';

function createSocialLinks() {
  const socials = [
    { name: 'Facebook', label: 'f', href: 'https://www.facebook.com/' },
    { name: 'X', label: 'X', href: 'https://x.com/' },
    { name: 'Instagram', label: '◎', href: 'https://www.instagram.com/' },
    { name: 'Dribbble', label: '◉', href: 'https://dribbble.com/' },
  ];
  const list = document.createElement('nav');
  list.className = 'custom-carousel-socials';
  list.setAttribute('aria-label', 'Social media');

  socials.forEach(({ name, label, href }) => {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', name);
    link.textContent = label;
    list.append(link);
  });
  return list;
}

function createDefaultContent() {
  const content = document.createElement('div');
  content.className = 'custom-carousel-content';

  const title = document.createElement('h1');
  title.textContent = defaultTitle;
  const description = document.createElement('p');
  description.textContent = defaultDescription;

  const actions = document.createElement('div');
  actions.className = 'custom-carousel-actions';
  [
    { label: 'Read More', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
  ].forEach(({ label, href }) => {
    const link = document.createElement('a');
    link.className = 'button';
    link.href = href;
    link.textContent = label;
    actions.append(link);
  });

  content.append(title, description, actions, createSocialLinks());
  return content;
}

function createSlide(row, index) {
  const cells = [...row.children];
  const imageCell = cells[0];
  const contentCell = cells[1];
  const authoredPicture = imageCell?.querySelector('picture');
  const authoredImage = imageCell?.querySelector('img');
  const authoredImageLink = imageCell?.querySelector('a[href]');
  const authoredImageText = imageCell?.textContent.trim();
  const authoredImageUrl = authoredImageLink?.href
    || (authoredImageText?.match(/^https?:\/\/\S+$/)?.[0] || '');

  const slide = document.createElement('article');
  slide.className = 'custom-carousel-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of 2`);

  const media = document.createElement('div');
  media.className = 'custom-carousel-media';
  if (authoredPicture) {
    const picture = authoredPicture.cloneNode(true);
    const image = picture.querySelector('img');
    if (image) {
      if (!image.getAttribute('src')) image.src = authoredImageUrl || slideImages[index];
      image.alt = image.alt || '';
      image.loading = index === 0 ? 'eager' : 'lazy';
    }
    media.append(picture);
  } else {
    const image = authoredImage?.cloneNode(true) || document.createElement('img');
    if (!image.getAttribute('src')) image.src = authoredImageUrl || slideImages[index];
    image.alt = image.alt || '';
    image.loading = index === 0 ? 'eager' : 'lazy';
    media.append(image);
  }

  const hasAuthoredContent = contentCell?.textContent.trim();
  const content = hasAuthoredContent ? contentCell.cloneNode(true) : createDefaultContent();
  content.className = 'custom-carousel-content';
  if (hasAuthoredContent) {
    const actions = document.createElement('div');
    actions.className = 'custom-carousel-actions';
    const authoredLinks = [...content.querySelectorAll('a')];
    if (authoredLinks.length) {
      authoredLinks.forEach((link) => {
        link.classList.add('button');
        actions.append(link);
      });
    } else {
      const defaults = createDefaultContent().querySelector('.custom-carousel-actions');
      actions.append(...defaults.children);
    }
    content.append(actions, createSocialLinks());
  }

  slide.append(media, content);
  return slide;
}

function createControl(direction, label) {
  const button = document.createElement('button');
  button.className = `custom-carousel-control custom-carousel-${direction}`;
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.innerHTML = '<span aria-hidden="true"></span>';
  return button;
}

export default function decorate(block) {
  const authoredRows = [...block.children].filter((row) => {
    const text = row.textContent.trim().toLowerCase();
    return text && !text.startsWith('custom-carousel');
  }).slice(0, 2);

  block.textContent = '';
  block.classList.add('custom-carousel');
  block.setAttribute('aria-roledescription', 'carousel');

  const slides = authoredRows.length
    ? authoredRows.map((row, index) => createSlide(row, index))
    : [0, 1].map((index) => createSlide(document.createElement('div'), index));
  if (slides.length === 1) slides.push(createSlide(document.createElement('div'), 1));

  const progress = document.createElement('div');
  progress.className = 'custom-carousel-progress';
  progress.setAttribute('aria-hidden', 'true');
  const progressFill = document.createElement('span');
  progress.append(progressFill);

  const track = document.createElement('div');
  track.className = 'custom-carousel-track';
  track.setAttribute('aria-live', 'polite');
  slides.forEach((slide, index) => {
    slide.hidden = index !== 0;
    track.append(slide);
  });

  const controls = document.createElement('div');
  controls.className = 'custom-carousel-controls';
  const previous = createControl('previous', 'Previous slide');
  const next = createControl('next', 'Next slide');
  controls.append(previous, next);

  let activeIndex = 0;
  let indicators;
  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== activeIndex;
    });
    [...indicators.children].forEach((indicator, indicatorIndex) => {
      indicator.setAttribute('aria-current', indicatorIndex === activeIndex ? 'true' : 'false');
    });
    progressFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    previous.disabled = activeIndex === 0;
  }

  indicators = document.createElement('div');
  indicators.className = 'custom-carousel-indicators';
  indicators.setAttribute('aria-label', 'Choose a slide');
  slides.forEach((slide, index) => {
    const indicator = document.createElement('button');
    indicator.type = 'button';
    indicator.className = 'custom-carousel-indicator';
    indicator.setAttribute('aria-label', `Show slide ${index + 1}`);
    indicator.setAttribute('aria-current', index === 0 ? 'true' : 'false');
    indicator.addEventListener('click', () => showSlide(index));
    indicators.append(indicator);
  });

  previous.addEventListener('click', () => showSlide(activeIndex - 1));
  next.addEventListener('click', () => showSlide(activeIndex + 1));
  showSlide(0);

  block.append(progress, track, controls, indicators);
}
