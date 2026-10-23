/* Soignon – copie TEST 6986205 – accessibilité V4 expérimentale.
 * Conserve les 8 autocomplete et le regroupement de V3, et masque visuellement
 * la bordure et le legend du vrai fieldset sans les retirer du DOM.
 * À TESTER exclusivement sur la copie, jamais directement en production.
 */
(function () {
  'use strict';
  const FORM_ID = '6986205';
  const entries = [
    ['votre nom', 'family-name'],
    ['votre prenom', 'given-name'],
    ['adresse', 'street-address'],
    ['code postal', 'postal-code'],
    ['ville', 'address-level2'],
    ['pays', 'country-name'],
    ['telephone', 'tel'],
    ['votre email', 'email']
  ];
  const normalize = text => (text || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/\*/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();

  function locate(form) {
    const found = new Map();
    for (const control of form.querySelectorAll('[data-role="control"]')) {
      const label = control.querySelector('[data-role="label"]');
      if (!label) continue;
      const key = normalize(label.textContent);
      if (!entries.some(([name]) => name === key) || found.has(key)) continue;
      const input = control.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea');
      if (input) found.set(key, { control, input });
    }
    return found;
  }

  function apply(form) {
    const found = locate(form);
    for (const [key, token] of entries) {
      const match = found.get(key);
      if (match && match.input.getAttribute('autocomplete') !== token) {
        match.input.setAttribute('autocomplete', token);
      }
    }
    form.dataset.soignonA11yMatched = String(found.size);

    // Ne créer un groupe que si les huit lignes virtuelles sont des frères
    // consécutifs, pour éviter tout déplacement partiel ou hors contexte.
    if (form.querySelector('[data-soignon-a11y-group="coordonnees"]')) return;
    if (found.size !== entries.length) return;
    const rows = entries.map(([key]) => found.get(key).control.parentElement);
    if (rows.some(row => !row || row.getAttribute('data-role') !== 'container' || row.getAttribute('data-type') !== 'virtual-form-table-row')) return;
    const parent = rows[0].parentElement;
    if (!parent || rows.some(row => row.parentElement !== parent) || parent.getAttribute('data-role') !== 'page-body') return;
    const siblings = Array.from(parent.children);
    const start = siblings.indexOf(rows[0]);
    if (start < 0 || rows.some((row, index) => siblings[start + index] !== row)) return;

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'soignon-a11y-fieldset';
    fieldset.setAttribute('data-soignon-a11y-group', 'coordonnees');
    const legend = document.createElement('legend');
    legend.className = 'soignon-a11y-visually-hidden';
    legend.textContent = 'Vos informations personnelles';
    fieldset.appendChild(legend);
    parent.insertBefore(fieldset, rows[0]);
    for (const row of rows) fieldset.appendChild(row);
    form.dataset.soignonA11yGroup = 'installed';
  }

  function init() {
    const form = document.querySelector('form[data-form-id="' + FORM_ID + '"]');
    if (!form || form.dataset.soignonA11yV4 === 'active') return false;
    form.dataset.soignonA11yV4 = 'active';
    const css = document.createElement('style');
    css.textContent = `
      /* Styles renforcés : 123FormBuilder applique parfois ses règles aux fieldset/legend. */
      form[data-form-id="6986205"] fieldset.soignon-a11y-fieldset {
        appearance: none !important; -webkit-appearance: none !important;
        box-sizing: border-box !important; display: block !important;
        width: 100% !important; max-width: 100% !important; min-width: 0 !important;
        margin: 0 !important; padding: 0 !important;
        border: none !important; border-width: 0 !important; border-radius: 0 !important;
        outline: none !important; box-shadow: none !important;
        background: transparent !important;
      }
      form[data-form-id="6986205"] fieldset.soignon-a11y-fieldset > legend.soignon-a11y-visually-hidden {
        position: absolute !important;
        width: 1px !important; height: 1px !important;
        padding: 0 !important; margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        clip-path: inset(50%) !important;
        white-space: nowrap !important;
        border: 0 !important;
        background: transparent !important;
        color: inherit !important;
      }
    `;
    form.prepend(css);
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; apply(form); });
    });
    apply(form);
    observer.observe(form, { childList: true, subtree: true });
    return true;
  }
  if (!init()) {
    const pending = new MutationObserver((_, observer) => {
      if (init()) observer.disconnect();
    });
    pending.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
