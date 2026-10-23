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


/* V8 – Correction visuelle ciblée des champs qui dépassent des fieldsets.
 * Dans 123FormBuilder, le conteneur du champ est aussi large que sa colonne
 * (614px dans la capture), tandis que la colonne garde une marge de 16px.
 * Réduire explicitement le conteneur de 24px, sans modifier les IDs, la validation,
 * les conditions d'affichage, ni l'intégration Zendesk.
 * Version à vérifier visuellement sur ordinateur et sur mobile.
 */
(function () {
  'use strict';
  const ID = 'soignon-a11y-v8-width-fix';
  if (document.getElementById(ID)) return;
  const sheet = document.createElement('style');
  sheet.id = ID;
  sheet.textContent = `
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset {
      box-sizing: border-box !important;
      min-width: 0 !important;
    }
    /* Adapter le conteneur directement : max-width seul n'avait pas suffi. */
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-column"] [data-role="input-container"] {
      width: calc(100% - 24px) !important;
      max-width: calc(100% - 24px) !important;
      box-sizing: border-box !important;
      min-width: 0 !important;
    }
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-column"] [data-role="input-container"] input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-column"] [data-role="input-container"] textarea,
    form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
      [data-role="input-column"] [data-role="input-container"] select {
      box-sizing: border-box !important;
      max-width: 100% !important;
    }
    @media (max-width: 720px) {
      form[data-form-id="6028752"] fieldset.soignon-a11y-fieldset
        [data-role="input-column"] [data-role="input-container"] {
        width: calc(100% - 12px) !important;
        max-width: calc(100% - 12px) !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(sheet);
})();


/* V9 – correction du débordement mesuré dans les trois fieldsets.
 * Conserve intégralement la V8 et ses modifications d'accessibilité.
 * Ne modifie ni les attributs métier des champs, ni les validations, ni Zendesk.
 * Ajuste seulement les largeurs visuelles des éléments dont le bord droit
 * dépasse réellement l'intérieur du fieldset, après chaque changement DOM/taille.
 */
(function () {
  'use strict';
  const FORM_ID = '6028752';
  const ROOT = 'form[data-form-id="' + FORM_ID + '"]';
  const ATTR = 'data-soignon-v9-adjusted';
  const PAD = 10; // réserve visuelle à droite de la bordure
  const TARGETS = [
    '[data-role="input-column"]',
    '[data-role="input-row"]',
    '[data-role="input-container"]',
    'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])',
    'textarea', 'select',
    '[data-role="upload"]', '[data-role="file-upload"]',
    'input[type="file"]'
  ].join(',');

  function isVisible(el) {
    return !!(el.getClientRects().length && el.getBoundingClientRect().width > 0);
  }
  function fit(el, maximumRight) {
    if (!isVisible(el)) return;
    // Repartir des styles précédents pour tenir compte d'un agrandissement de fenêtre.
    const rect = el.getBoundingClientRect();
    const overflow = rect.right - maximumRight;
    if (overflow <= 1) return;
    const current = rect.width;
    if (current <= 80) return;
    const newWidth = Math.max(80, current - overflow - 1);
    const last = Number(el.getAttribute(ATTR));
    if (Number.isFinite(last) && last > 0 && Math.abs(last - newWidth) < 1) return;
    el.style.setProperty('box-sizing', 'border-box', 'important');
    el.style.setProperty('width', newWidth.toFixed(1) + 'px', 'important');
    el.style.setProperty('max-width', newWidth.toFixed(1) + 'px', 'important');
    el.style.setProperty('min-width', '0', 'important');
    el.setAttribute(ATTR, newWidth.toFixed(1));
  }

  let scheduled = false;
  function adjust() {
    scheduled = false;
    const form = document.querySelector(ROOT);
    if (!form) return;
    for (const fieldset of form.querySelectorAll('fieldset.soignon-a11y-fieldset')) {
      if (!isVisible(fieldset)) continue;
      const right = fieldset.getBoundingClientRect().right - PAD;
      // Traitement des ancêtres avant leurs descendants : champs simples, dates,
      // zones de message, téléphone/email et téléversement de fichiers.
      for (const el of fieldset.querySelectorAll(TARGETS)) {
        fit(el, right);
      }
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(adjust);
  }
  function start() {
    const form = document.querySelector(ROOT);
    if (!form) return false;
    if (form.dataset.soignonV9Fix === 'active') return true;
    form.dataset.soignonV9Fix = 'active';
    const observer = new MutationObserver(records => {
      // Observer seulement les ajouts/retraits : les changements de style opérés
      // ci-dessus ne doivent pas relancer sans fin le correctif.
      if (records.some(r => r.type === 'childList')) schedule();
    });
    observer.observe(form, {subtree: true, childList: true});
    window.addEventListener('resize', () => {
      // Supprimer les largeurs fixes de V9 avant une nouvelle mesure responsive.
      for (const el of form.querySelectorAll('[' + ATTR + ']')) {
        el.style.removeProperty('width');
        el.style.removeProperty('max-width');
        el.removeAttribute(ATTR);
      }
      schedule();
    }, {passive: true});
    schedule();
    return true;
  }
  if (!start()) {
    const pending = new MutationObserver((_, observer) => {
      if (start()) observer.disconnect();
    });
    pending.observe(document.documentElement, {childList: true, subtree: true});
  }
})();
