function createCard(product) {
  const card = document.createElement('article');
  card.className = 'product-card';

  if (product.image) {
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.title || '';
    image.loading = 'lazy';
    card.append(image);
  }

  const body = document.createElement('div');
  body.className = 'product-card-body';

  const title = document.createElement('h3');
  title.textContent = product.title || 'Untitled';
  body.append(title);

  if (product.description) {
    const description = document.createElement('p');
    description.textContent = product.description;
    body.append(description);
  }

  if (product.link) {
    const link = document.createElement('a');
    link.href = product.link;
    link.textContent = 'Learn more';
    link.className = 'button';
    body.append(link);
  }

  card.append(body);
  return card;
}

export default async function decorate(block) {
  const authoredLink = block.querySelector('a');
  const source = authoredLink?.getAttribute('href') || '/products/spreadsheet-demo.json';

  block.textContent = '';

  try {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`Products request failed: ${response.status}`);
    }

    const json = await response.json();
    const products = Array.isArray(json.data) ? json.data : [];

    if (!products.length) {
      block.textContent = 'No products are available.';
      return;
    }

    const cardList = document.createElement('div');
    cardList.className = 'product-card-list';

    products.forEach((product) => {
      cardList.append(createCard(product));
    });

    block.append(cardList);
  } catch (error) {
    console.error('Unable to load the products sheet:', error);
    block.textContent = 'Product information is temporarily unavailable.';
  }
}
