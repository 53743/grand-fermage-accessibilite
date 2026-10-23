/* Soignon original 6028752 — V7 : V4 autonome + correction des colonnes.
 * Réduit la largeur des champs de saisie à l'intérieur des groupes sans modifier
 * les règles conditionnelles, les noms de champs, les consentements ou Zendesk.
 * Version candidate : contrôler les différents choix et l'affichage mobile.
 */
/* Soignon – formulaire original 6028752 – accessibilité, V4 – 3 groupes visibles.
 * Adaptation de la V5 validée visuellement sur la copie test 6986205.
 * Version candidate pour le formulaire original : vérification fonctionnelle nécessaire.
 * Coordonnées, informations de demande et consentements : legend et bordures visibles.
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
  // Regrouper uniquement des lignes contiguës, sans changer les contrôles eux-mêmes.
  function virtualRow(el) {
    return el && el.getAttribute('data-role') === 'container' &&
      el.getAttribute('data-type') === 'virtual-form-table-row';
  }
  function controlLabel(row) {
    const label = row.querySelector('[data-role="control"] [data-role="label"]');
    return normalize(label ? label.textContent : '');
  }
  function makeGroup(form, name, title, rows) {
    if (form.querySelector('[data-soignon-a11y-group="' + name + '"]')) return;
    if (!rows.length || rows.some(row => !virtualRow(row))) return;
    const parent = rows[0].parentElement;
    if (!parent || parent.getAttribute('data-role') !== 'page-body' ||
        rows.some(row => row.parentElement !== parent)) return;
    const children = Array.from(parent.children);
    const start = children.indexOf(rows[0]);
    if (start < 0 || rows.some((row, i) => children[start + i] !== row)) return;
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'soignon-a11y-fieldset';
    fieldset.setAttribute('data-soignon-a11y-group', name);
    const legend = document.createElement('legend');
    legend.className = 'soignon-a11y-legend-visible';
    legend.textContent = title;
    fieldset.appendChild(legend);
    enforceVisualStyles(fieldset);
    parent.insertBefore(fieldset, rows[0]);
    for (const row of rows) fieldset.appendChild(row);
  }
  function addOtherGroups(form) {
    const body = form.querySelector('[data-role="page-body"]');
    if (!body) return;
    // Regroupement des informations de réclamation : commence au premier produit,
    // termine après les deux emplacements pour pièces jointes, avant les consentements.
    if (!form.querySelector('[data-soignon-a11y-group="demande"]')) {
      const children = Array.from(body.children);
      const first = children.findIndex(row => virtualRow(row) &&
        ['produit concerne', 'produit'].includes(controlLabel(row)));
      // Les deux cases de consentement doivent être repérées sans ambiguïté.
      const consent = children.findIndex(row => virtualRow(row) &&
        row.querySelector('input[type="checkbox"]') &&
        normalize(row.textContent).includes('en cochant cette case'));
      if (first >= 0 && consent > first && consent - first <= 18) {
        const candidates = children.slice(first, consent);
        const hasMessage = candidates.some(row => controlLabel(row) === 'votre message');
        if (hasMessage && candidates.every(virtualRow)) {
          makeGroup(form, 'demande', 'Informations relatives à votre demande', candidates);
        }
      }
    }
    if (!form.querySelector('[data-soignon-a11y-group="consentements"]')) {
      const children = Array.from(body.children);
      const first = children.findIndex(row => virtualRow(row) &&
        row.querySelector('input[type="checkbox"]') &&
        normalize(row.textContent).includes('en cochant cette case'));
      if (first >= 0 && first + 1 < children.length) {
        const next = children[first + 1];
        if (virtualRow(next) && next.querySelector('input[type="checkbox"]') &&
          normalize(next.textContent).includes('donnees concernant votre sante')) {
          makeGroup(form, 'consentements', 'Consentements et protection des données', [children[first], next]);
        }
      }
    }
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
    if (form.querySelector('[data-soignon-a11y-group="coordonnees"]')) {
      addOtherGroups(form);
      return;
    }
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
    addOtherGroups(form);
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
    if (!form || form.dataset.soignonA11yV4 === 'active') return false;
    form.dataset.soignonA11yV4 = 'active';
    const css = document.createElement('style');
    css.id = 'soignon-a11y-original-v4-css';
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
        for (const fieldset of form.querySelectorAll('fieldset.soignon-a11y-fieldset')) {
          enforceVisualStyles(fieldset);
        }
      });
    });
    apply(form);
    for (const fieldset of form.querySelectorAll('fieldset.soignon-a11y-fieldset')) {
      enforceVisualStyles(fieldset);
    }
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



/* V7 – Ajustement ciblé des colonnes, fondé sur l'essai dans Chrome.
 * Ne modifie pas les identifiants, valeurs, validations ni les événements.
 * L'effet doit être vérifié en production et sur mobile avant validation.
 */
(function () {
  'use strict';
  const STYLE_ID = 'soignon-a11y-v7-column-fix';
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset {
      box-sizing: border-box !important;
      min-width: 0 !important;
    }
    /* La correction testée s'applique sur la colonne, pas sur l'input. */
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-column"] {
      max-width: calc(100% - 24px) !important;
      box-sizing: border-box !important;
      min-width: 0 !important;
    }
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-container"] {
      box-sizing: border-box !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
    /* Les champs gardent leur comportement normal dans leurs conteneurs. */
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-container"] > input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-container"] > textarea,
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-container"] > select {
      box-sizing: border-box !important;
      max-width: 100% !important;
    }
    @media (max-width: 720px) {
      form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset {
        max-width: 100% !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
      form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
        [data-role="container"][data-type="virtual-form-table-row"] {
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }
      form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
        [data-role="input-column"] {
        max-width: calc(100% - 16px) !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();
