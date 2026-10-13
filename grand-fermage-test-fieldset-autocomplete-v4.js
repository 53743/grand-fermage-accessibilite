/* Grand Fermage TEST (formulaire 6984459) — validation uniquement.
   Ne pas installer sur le formulaire Grand Fermage original.
   Le script déplace des conteneurs existants : tester les règles conditionnelles,
   la mise en page, les pièces jointes et la soumission avant toute mise en production.
*/
(function () {
  'use strict';
  const GROUPS = [
    { name: 'Vos informations personnelles', first: '121979245', last: '121979252' },
    { name: 'Informations relatives à votre demande', first: '121979253', last: '121979262' },
    { name: 'Consentements et protection des données', first: '121979264', last: '121979265' }
  ];
  const ROW = ':scope > [data-role="container"][data-type="virtual-form-table-row"]';
  function findRow(page, id) {
    const control = page.querySelector('[data-role="control"][data-id="' + id + '"]');
    if (!control) return null;
    const row = control.closest('[data-role="container"][data-type="virtual-form-table-row"]');
    return row && row.parentElement === page ? row : null;
  }
  function install() {
    const page = document.querySelector('#form [data-role="page-body"]');
    if (!page) return false;
    if (page.querySelector('fieldset.gf-fieldset')) return true;
    const plans = [];
    for (const group of GROUPS) {
      const first = findRow(page, group.first);
      const last = findRow(page, group.last);
      if (!first || !last) return false;
      const rows = [];
      for (let row = first; row; row = row.nextElementSibling) {
        if (!row.matches(ROW.replace(':scope > ', ''))) return false;
        rows.push(row);
        if (row === last) break;
      }
      if (rows[rows.length - 1] !== last) return false;
      plans.push({ name: group.name, rows, first });
    }
    const allRows = plans.flatMap(p => p.rows);
    if (new Set(allRows).size !== allRows.length) {
      console.warn('[Grand Fermage TEST] Groupes chevauchants : aucun changement.');
      return true;
    }
    // Tout est vérifié avant la première modification du DOM.
    for (const plan of plans) {
      const fs = document.createElement('fieldset');
      fs.className = 'gf-fieldset';
      const legend = document.createElement('legend');
      legend.className = 'sr-only';
      legend.textContent = plan.name;
      fs.appendChild(legend);
      plan.first.before(fs);
      for (const row of plan.rows) fs.appendChild(row);
    }
    console.info('[Grand Fermage TEST] 3 fieldsets ajoutés. Contrôler apparence, conditions et soumission.');
    return true;
  }
  let attempts = 0;
  const handle = window.setInterval(function () {
    attempts += 1;
    if (install() || attempts >= 60) {
      window.clearInterval(handle);
      if (attempts >= 60) {
        console.warn('[Grand Fermage TEST] Aucun fieldset ajouté après 15 s : vérifier le rendu du formulaire.');
      }
    }
  }, 250);
})();


/* RGAA 11.13 : compléter autocomplete sans modifier valeurs ou traitement des champs. */
(function () {
  'use strict';
  const fields = [
    ["121979245", "family-name"],
    ["121979246", "given-name"],
    ["121979247", "street-address"],
    ["121979248", "postal-code"],
    ["121979249", "address-level2"],
    ["121979250", "country-name"],
    ["121979251", "tel"],
    ["121979252", "email"]
  ];
  function applyAutocomplete() {
    const page = document.querySelector('#form [data-role="page-body"]');
    if (!page) return false;
    let found = 0;
    for (const [id, value] of fields) {
      const control = page.querySelector('[data-role="control"][data-id="' + id + '"]');
      if (!control) continue;
      const input = control.querySelector('input[data-role="i123-input"]');
      if (!input) continue;
      input.setAttribute('autocomplete', value);
      found++;
    }
    if (found === fields.length) {
      console.info('[Grand Fermage] Autocomplete renseigné sur 8 champs.');
      return true;
    }
    return false;
  }
  if (!applyAutocomplete()) {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (applyAutocomplete() || attempts >= 60) {
        clearInterval(timer);
        if (attempts >= 60) console.warn('[Grand Fermage] Vérifier les attributs autocomplete.');
      }
    }, 250);
  }
})();
