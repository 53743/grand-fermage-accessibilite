/* Soignon – formulaire 123FormBuilder TEST n° 6986205
 * Correctifs d'accessibilité V1 : autocomplete et groupe de coordonnées.
 * Version réservée à la copie TEST. Ne pas installer sur le formulaire original.
 * Ne modifie ni la valeur des champs, ni leur nom, ni les paramètres Zendesk.
 */
(function () {
  'use strict';
  const form = document.querySelector('form[data-form-id="6986205"]');
  if (!form || window.__soignonAccessibilityTestV1) return;
  window.__soignonAccessibilityTestV1 = true;

  const fields = [
    ['99348317', 'family-name'],
    ['99348318', 'given-name'],
    ['99348319', 'street-address'],
    ['112293139', 'postal-code'],
    ['99348321', 'address-level2'],
    ['99348322', 'country-name'],
    ['99348323', 'tel'],
    ['99348324', 'email']
  ];

  const css = document.createElement('style');
  css.id = 'soignon-a11y-v1-style';
  css.textContent = `
    #form fieldset.soignon-a11y-group {
      box-sizing: border-box;
      display: block;
      width: 100%; min-width: 0;
      margin: 0; padding: 0; border: 0;
    }
    #form fieldset.soignon-a11y-group > legend.soignon-a11y-sr-only {
      position: absolute !important;
      width: 1px !important; height: 1px !important;
      padding: 0 !important; margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0,0,0,0) !important;
      white-space: nowrap !important; border: 0 !important;
    }
  `;
  form.prepend(css);

  function applyAutocompletes() {
    for (const [id, value] of fields) {
      const control = form.querySelector('[data-role="control"][data-id="' + id + '"]');
      if (!control) continue;
      const input = control.querySelector('input:not([type="hidden"]), textarea, select');
      if (input && input.getAttribute('autocomplete') !== value) {
        input.setAttribute('autocomplete', value);
      }
    }
  }

  function groupCoordinates() {
    if (form.querySelector('fieldset.soignon-a11y-group')) return;
    const rows = fields.map(([id]) => {
      const control = form.querySelector('[data-role="control"][data-id="' + id + '"]');
      return control && control.parentElement;
    });
    if (rows.some(row => !row || row.getAttribute('data-role') !== 'container')) return;
    const parent = rows[0].parentElement;
    if (!parent || rows.some(row => row.parentElement !== parent)) return;
    const siblings = Array.from(parent.children);
    const start = siblings.indexOf(rows[0]);
    if (start < 0 || rows.some((row, i) => siblings[start + i] !== row)) return;

    const group = document.createElement('fieldset');
    group.className = 'soignon-a11y-group';
    group.setAttribute('data-soignon-a11y', 'contact');
    const legend = document.createElement('legend');
    legend.className = 'soignon-a11y-sr-only';
    legend.textContent = 'Vos coordonnées personnelles';
    group.appendChild(legend);
    parent.insertBefore(group, rows[0]);
    for (const row of rows) group.appendChild(row);
  }

  // La duplication peut modifier les data-id des champs : n'appliquer le regroupement
  // que lorsque tous les identifiants attendus sont présents.
  applyAutocompletes();
  groupCoordinates();

  // 123FormBuilder peut reconstruire des champs lors des changements conditionnels.
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAutocompletes();
      groupCoordinates();
    });
  });
  observer.observe(form, { subtree: true, childList: true });
})();
