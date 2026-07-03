/* Laadt content.json en vult tekst, links en merkkleuren in.
   Let op: dit raakt bewust GEEN koppen die door app.js worden
   geanimeerd (split-text effect) — die blijven vaste ontwerptekst. */
fetch('/content.json')
  .then(res => res.json())
  .then(data => {
    document.querySelectorAll('[data-content]').forEach(el => {
      const key = el.getAttribute('data-content');
      if (data[key] !== undefined) el.textContent = data[key];
    });
    document.querySelectorAll('[data-content-href]').forEach(el => {
      const key = el.getAttribute('data-content-href');
      if (data[key] !== undefined) el.href = data[key];
    });
    if (data.brandColor) document.documentElement.style.setProperty('--brand', data.brandColor);
    if (data.adlColor) document.documentElement.style.setProperty('--adl', data.adlColor);
  })
  .catch(err => console.error('content.json kon niet geladen worden:', err));
