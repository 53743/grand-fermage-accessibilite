/* Soignon 6028752 — V5 : V4 + correction ciblée des débordements horizontaux.
 * Conserver les 3 fieldset/legend, autocomplete et conditions de la V4.
 * Possibilité de revenir en arrière en remettant l'URL V4 dans 123FormBuilder.
 */
(function () {
  'use strict';
  const ID = '6028752';
  const previous = 'https://53743.github.io/grand-fermage-accessibilite/soignon-accessibilite-original-6028752-v4.js';
  if (!document.querySelector('script[data-soignon-v5-loader]')) {
    const script = document.createElement('script');
    script.src = previous;
    script.async = false;
    script.dataset.soignonV5Loader = '1';
    (document.head || document.documentElement).appendChild(script);
  }
  if (document.getElementById('soignon-accessibilite-v5-fix')) return;
  const style = document.createElement('style');
  style.id = 'soignon-accessibilite-v5-fix';
  style.textContent = `
    /* La grille 123FormBuilder peut fixer des largeurs en pixels et créer
       un dépassement des champs au bord droit des nouveaux fieldsets. */
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset {
      box-sizing: border-box !important;
      padding-right: 18px !important;
    }
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset > [data-role="container"] {
      box-sizing: border-box !important;
      width: calc(100% - 12px) !important;
      max-width: calc(100% - 12px) !important;
      min-width: 0 !important;
    }
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset [data-role="input-column"],
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset [data-role="input-row"],
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset [data-role="input-container"] {
      box-sizing: border-box !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset textarea,
    form[data-form-id="${ID}"] fieldset.soignon-a11y-fieldset select {
      box-sizing: border-box !important;
      max-width: 100% !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();
