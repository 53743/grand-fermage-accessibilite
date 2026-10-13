/* Grand Fermage — formulaire ORIGINAL, version de VALIDATION uniquement.
 * Ne pas activer sur le formulaire public avant les tests fonctionnels et RGAA.
 * Ajoute trois regroupements fieldset/legend en conservant les champs existants.
 */
(function () {
  'use strict';
  const GROUPS = [
    { title: 'Vos informations personnelles', firstId: '99413380', lastId: '99413387', firstLabel: 'Votre nom', lastLabel: 'Votre Email' },
    { title: 'Informations relatives à votre demande', firstId: '99413389', lastId: '120863618', firstLabel: 'Produit', lastLabel: 'ticket' },
    { title: 'Consentements et protection des données', firstId: '119715646', lastId: '119715647', firstLabel: '', lastLabel: '' }
  ];

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

    const plans = GROUPS.map(g => {
      const first = findRow(page, g.firstId);
      const last = findRow(page, g.lastId);
      if (!first || !last) return null;
      const rows = [];
      for (let node = first; node; node = node.nextElementSibling) {
        rows.push(node);
        if (node === last) break;
      }
      if (rows[rows.length - 1] !== last) return null;
      return { title: g.title, first, rows };
    });
    if (plans.some(p => !p)) return false;
    // Vérifier que les groupes ne se recouvrent pas avant tout déplacement.
    const rows = plans.flatMap(p => p.rows);
    if (new Set(rows).size !== rows.length) {
      console.warn('[Grand Fermage] Groupes chevauchants : aucun changement.');
      return true;
    }

    plans.forEach(plan => {
      const fs = document.createElement('fieldset');
      fs.className = 'gf-fieldset';
      const legend = document.createElement('legend');
      legend.className = 'sr-only';
      legend.textContent = plan.title;
      fs.appendChild(legend);
      plan.first.before(fs);
      plan.rows.forEach(row => fs.appendChild(row));
    });
    console.info('[Grand Fermage] 3 fieldsets ajoutés au DOM — vérifier tous les comportements avant production.');
    return true;
  }

  function start() {
    if (install()) return;
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      if (!document.querySelector('#form fieldset.gf-fieldset')) {
        console.warn('[Grand Fermage] Aucun fieldset : identifiants ou structure différents du formulaire original.');
      }
    }, 15000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();


/* RGAA 11.13 : compléter autocomplete sans modifier valeurs ou traitement des champs. */
(function () {
  'use strict';
  const fields = [
    ["99413380", "family-name"],
    ["99413381", "given-name"],
    ["99413382", "street-address"],
    ["112293133", "postal-code"],
    ["99413384", "address-level2"],
    ["99413385", "country-name"],
    ["99413386", "tel"],
    ["99413387", "email"]
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
