/* Soignon – formulaire original 6028752 – accessibilité, V3 – titre et bordure de groupe visibles.
 * Adaptation de la V5 validée visuellement sur la copie test 6986205.
 * À contrôler sur la copie de test avant mise en production.
 * Le titre « Vos informations personnelles » et la bordure du groupe sont visibles.
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
    legend.className = 'soignon-a11y-legend-visible';
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
      'margin':'0 0 12px 0', 'padding':'4px 12px 10px', 'border':'1px solid #b5b5b5', 'border-radius':'0',
      'outline':'0', 'box-shadow':'none', 'background':'transparent'
    };
    for (const [property, value] of Object.entries(rules)) {
      fieldset.style.setProperty(property, value, 'important');
    }
    const legend = fieldset.querySelector(':scope > legend.soignon-a11y-legend-visible');
    if (!legend) return;
    const visible = {
      'position':'static', 'display':'block', 'width':'auto', 'height':'auto',
      'padding':'0 6px', 'margin':'0 0 8px 0', 'overflow':'visible',
      'clip':'auto', 'clip-path':'none', 'white-space':'normal',
      'border':'0', 'font-weight':'600', 'font-size':'1em', 'color':'inherit'
    };
    for (const [property, value] of Object.entries(visible)) {
      legend.style.setProperty(property, value, 'important');
    }
  }
  function init() {
    const form = document.querySelector('form[data-form-id="' + FORM_ID + '"]');
    if (!form || form.dataset.soignonA11yV3 === 'active') return false;
    form.dataset.soignonA11yV3 = 'active';
    const css = document.createElement('style');
    css.id = 'soignon-a11y-original-v3-css';
    css.textContent = `
      form[data-form-id="${FORM_ID}"] fieldset.soignon-a11y-fieldset {
        appearance: none !important; -webkit-appearance: none !important;
        box-sizing: border-box !important; display: block !important;
        width: 100% !important; max-width: 100% !important; min-width: 0 !important;
        margin: 0 0 12px 0 !important; padding: 4px 12px 10px !important; border: 1px solid #b5b5b5 !important;
        outline: 0 !important; box-shadow: none !important; background: transparent !important;
      }
      form[data-form-id="${FORM_ID}"] fieldset.soignon-a11y-fieldset > legend.soignon-a11y-legend-visible {
        position: static !important; display: block !important;
        width: auto !important; height: auto !important;
        padding: 0 6px !important; margin: 0 0 8px 0 !important;
        overflow: visible !important; clip: auto !important; clip-path: none !important;
        white-space: normal !important; border: 0 !important;
        font-weight: 600 !important; font-size: 1em !important; color: inherit !important;
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
