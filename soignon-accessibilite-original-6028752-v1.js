/* Soignon – formulaire original 6028752 – accessibilité, version candidate.
 * Adaptation de la V5 validée visuellement sur la copie test 6986205.
 * Vérifier les règles conditionnelles et les envois avant toute mise en production.
 */
(function () {
  'use strict';
  const FORM_ID = '6028752';
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
    // Éviter un regroupement partiel ou de lignes non consécutives.
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
    enforceVisualStyles(fieldset);
    parent.insertBefore(fieldset, rows[0]);
    for (const row of rows) fieldset.appendChild(row);
    form.dataset.soignonA11yGroup = 'installed';
  }
  function enforceVisualStyles(fieldset) {
    const rules = {
      'appearance':'none', '-webkit-appearance':'none', 'box-sizing':'border-box',
      'display':'block', 'width':'100%', 'max-width':'100%', 'min-width':'0',
      'margin':'0', 'padding':'0', 'border':'0', 'border-radius':'0',
      'outline':'0', 'box-shadow':'none', 'background':'transparent'
    };
    for (const [property, value] of Object.entries(rules)) {
      fieldset.style.setProperty(property, value, 'important');
    }
    const legend = fieldset.querySelector(':scope > legend.soignon-a11y-visually-hidden');
    if (!legend) return;
    const hidden = {
      'position':'absolute', 'width':'1px', 'height':'1px', 'padding':'0',
      'margin':'-1px', 'overflow':'hidden', 'clip':'rect(0, 0, 0, 0)',
      'clip-path':'inset(50%)', 'white-space':'nowrap', 'border':'0'
    };
    for (const [property, value] of Object.entries(hidden)) {
      legend.style.setProperty(property, value, 'important');
    }
  }
  function init() {
    const form = document.querySelector('form[data-form-id="' + FORM_ID + '"]');
    if (!form || form.dataset.soignonA11yV5 === 'active') return false;
    form.dataset.soignonA11yV5 = 'active';
    const css = document.createElement('style');
    css.id = 'soignon-a11y-original-css';
    css.textContent = `
      form[data-form-id="${FORM_ID}"] fieldset.soignon-a11y-fieldset {
        appearance: none !important; -webkit-appearance: none !important;
        box-sizing: border-box !important; display: block !important;
        width: 100% !important; max-width: 100% !important; min-width: 0 !important;
        margin: 0 !important; padding: 0 !important; border: 0 !important;
        outline: 0 !important; box-shadow: none !important; background: transparent !important;
      }
      form[data-form-id="${FORM_ID}"] fieldset.soignon-a11y-fieldset > legend.soignon-a11y-visually-hidden {
        position: absolute !important; width: 1px !important; height: 1px !important;
        padding: 0 !important; margin: -1px !important; overflow: hidden !important;
        clip: rect(0,0,0,0) !important; clip-path: inset(50%) !important;
        white-space: nowrap !important; border: 0 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(css);
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        apply(form);
        const fieldset = form.querySelector('[data-soignon-a11y-group="coordonnees"]');
        if (fieldset) enforceVisualStyles(fieldset);
      });
    });
    apply(form);
    const fieldset = form.querySelector('[data-soignon-a11y-group="coordonnees"]');
    if (fieldset) enforceVisualStyles(fieldset);
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
