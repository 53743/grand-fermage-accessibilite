/* Soignon — TEST 123FormBuilder 6986205 — accessibilité V2.
 * Repérage des champs par libellé (pas par data-id).
 * À utiliser UNIQUEMENT sur la copie TEST. Ne touche pas à Zendesk.
 */
(function () {
  'use strict';
  const FORM_ID = '6986205';
  const MAP = new Map([
    ['votre nom', 'family-name'],
    ['votre prenom', 'given-name'],
    ['adresse', 'street-address'],
    ['code postal', 'postal-code'],
    ['ville', 'address-level2'],
    ['pays', 'country-name'],
    ['telephone', 'tel'],
    ['votre email', 'email']
  ]);
  const normalize = value => (value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

  function apply(form) {
    const found = new Map();
    form.querySelectorAll('[data-role="control"]').forEach(control => {
      const label = control.querySelector('[data-role="label"]');
      if (!label) return;
      const name = normalize(label.textContent);
      if (!MAP.has(name) || found.has(name)) return;
      const input = control.querySelector('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select');
      if (!input) return;
      input.setAttribute('autocomplete', MAP.get(name));
      found.set(name, control);
    });

    // Ne déplacer les éléments que si le regroupement conserve rigoureusement
    // la structure existante. Les conteneurs virtuels de 123FormBuilder sont
    // généralement gérés dynamiquement : par sécurité, V2 ne les déplace pas.
    // Un fieldset réel sera ajouté seulement après vérification du comportement
    // de la copie TEST et validation de la structure de ses conteneurs.
    form.dataset.soignonA11yMatched = String(found.size);
  }

  function init() {
    const form = document.querySelector('form[data-form-id="' + FORM_ID + '"]');
    if (!form || form.dataset.soignonA11yV2 === 'active') return false;
    form.dataset.soignonA11yV2 = 'active';
    apply(form);
    let scheduled = false;
    new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; apply(form); });
    }).observe(form, { childList: true, subtree: true });
    return true;
  }
  if (!init()) {
    const wait = new MutationObserver((_, obs) => { if (init()) obs.disconnect(); });
    wait.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
