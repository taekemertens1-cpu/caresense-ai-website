/* Laadt content.json SYNCHROON, vóórdat app.js draait.
   Dat is bewust: app.js animeert koppen woord-voor-woord bij het laden
   (split-text effect). Als we de tekst pas ná die animatie zouden
   aanpassen, zou de animatie-opmaak weer verdwijnen. Door dit bestand
   als allereerste script te laden (zie index.html) staat alle tekst
   al vast voordat app.js ook maar begint. content.json is klein en
   komt van dezelfde server, dus dit kost in de praktijk niets merkbaars. */
(function () {
  'use strict';

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  var data;
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/content.json', false); // false = synchroon
    xhr.send(null);
    data = JSON.parse(xhr.responseText);
  } catch (e) {
    console.error('content.json kon niet geladen worden:', e);
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Gewone tekst
    document.querySelectorAll('[data-content]').forEach(function (el) {
      var val = getPath(data, el.getAttribute('data-content'));
      if (val !== undefined) el.textContent = val;
    });

    // Tekst die HTML mag bevatten (bv. <b>vet</b> binnen een zin)
    document.querySelectorAll('[data-content-html]').forEach(function (el) {
      var val = getPath(data, el.getAttribute('data-content-html'));
      if (val !== undefined) el.innerHTML = val;
    });

    // Links (tel:, mailto:, of gewone hrefs die moeten meebewegen met tekst)
    document.querySelectorAll('[data-content-href]').forEach(function (el) {
      var val = getPath(data, el.getAttribute('data-content-href'));
      if (val !== undefined) el.href = val;
    });

    // Prijzen: zet zowel de zichtbare tekst als de data-monthly/data-yearly
    // attributen die het maandelijks/jaarlijks-schuifje (togglePrice) uitleest
    document.querySelectorAll('[data-content-monthly]').forEach(function (el) {
      var monthlyKey = el.getAttribute('data-content-monthly');
      var yearlyKey = el.getAttribute('data-content-yearly');
      var monthly = getPath(data, monthlyKey);
      var yearly = yearlyKey ? getPath(data, yearlyKey) : undefined;
      if (monthly !== undefined) {
        el.dataset.monthly = monthly;
        el.textContent = monthly; // maandelijks is de standaardweergave
      }
      if (yearly !== undefined) el.dataset.yearly = yearly;
    });

    // Tellers (de statistieken die omhoog animeren): pas het startpunt
    // (data-count) aan, niet de zichtbare "0" — animateCount() in app.js
    // leest data-count uit zodra het element in beeld komt.
    document.querySelectorAll('[data-content-count]').forEach(function (el) {
      var countKey = el.getAttribute('data-content-count');
      var suffixKey = el.getAttribute('data-content-suffix');
      var count = getPath(data, countKey);
      var suffix = suffixKey ? getPath(data, suffixKey) : undefined;
      if (count !== undefined) el.dataset.count = count;
      if (suffix !== undefined) el.dataset.suffix = suffix;
    });

    // Merkkleuren
    var colors = data.colors || {};
    if (colors.brandColor) document.documentElement.style.setProperty('--brand', colors.brandColor);
    if (colors.adlColor) document.documentElement.style.setProperty('--adl', colors.adlColor);
  });
})();
