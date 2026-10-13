/* Grand Fermage TEST - regroupements accessibles (version 2)
 * Ne pas mettre en production sans tests de conditions, validation, envoi et lecteurs d'ecran.
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
    if (!page) return false;
    if (page.querySelector('fieldset.gf-fieldset')) return true;

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

    // A la difference de la V1, attendre que tous les champs soient effectivement rendus.
    if (plans.some(plan => !plan)) return false;

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
    console.info('[Grand Fermage] 3 fieldsets créés (TEST v2).');
    return true;
  }

  function start() {
    if (addGroups()) return;
    const observer = new MutationObserver(() => {
      if (addGroups()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // Arrêt de sécurité : ne pas surveiller indéfiniment.
    setTimeout(() => {
      observer.disconnect();
      if (!document.querySelector('#form fieldset.gf-fieldset')) {
        console.warn('[Grand Fermage] Aucun fieldset ajouté : vérifier la structure du formulaire TEST.');
      }
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
