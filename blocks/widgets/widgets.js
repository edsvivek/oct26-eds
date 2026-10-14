// widgets.js
// Minimal JavaScript for widgets block

document.addEventListener('DOMContentLoaded', function () {
  const widgets = document.querySelectorAll('.widget');
  widgets.forEach(w => {
    // Example: add a simple click handler
    w.addEventListener('click', () => {
      w.classList.toggle('widget--active');
    });
  });
});
