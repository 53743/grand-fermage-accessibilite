/* Grand Fermage TEST – regroupements accessibles.
 * Fichier de test : vérifier affichage, champs conditionnels, validations et envoi.
 * À héberger sur une URL HTTPS publique avant de renseigner 123FormBuilder.
 */
(function () {
  'use strict';

  const groups = [
    { name: 'Vos informations personnelles', first: '99413380', last: '99413387' },
    { name: 'Informations relatives à votre demande', first: '99413389', last: '120863618' },
    { name: 'Consentements et protection des données', first: '119715646', last: '119715647' }
  ];

  function addGroups() {
    const page = document.querySelector('#form [data-role="page-body"]');
    if (!page || page.querySelector('fieldset.gf-fieldset')) return false;

    // Ne rien déplacer si la structure du formulaire est différente de celle inspectée.
    const plans = groups.map(group => {
      const start = page.querySelector('[data-role="control"][data-id="' + group.first + '"]');
      const end = page.querySelector('[data-role="control"][data-id="' + group.last + '"]');
      const first = start && start.closest('[data-role="container"][data-type="virtual-form-table-row"]');
      const last = end && end.closest('[data-role="container"][data-type="virtual-form-table-row"]');
      if (!first || !last || first.parentElement !== page || last.parentElement !== page) return null;
      const nodes = [];
      for (let node = first; node; node = node.nextElementSibling) {
        nodes.push(node);
        if (node === last) break;
      }
      if (nodes[nodes.length - 1] !== last) return null;
      return { group, first, nodes };
    });
    if (plans.some(plan => !plan)) {
      console.warn('[Grand Fermage] Fieldsets non ajoutés : structure inattendue.');
      return true;
    }

    plans.forEach(({ group, first, nodes }) => {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'gf-fieldset';
      const legend = document.createElement('legend');
      legend.className = 'sr-only';
      legend.textContent = group.name;
      fieldset.appendChild(legend);
      first.before(fieldset);
      nodes.forEach(node => fieldset.appendChild(node));
    });
    return true;
  }

  function start() {
    if (addGroups()) return;
    // 123FormBuilder peut construire le formulaire après DOMContentLoaded.
    let attempts = 0;
    const observer = new MutationObserver(() => {
      if (addGroups() || ++attempts > 100) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
