
(function () {
  "use strict";

  const correspondances = {
    "votre nom": "family-name",
    "votre prenom": "given-name",
    "adresse": "street-address",
    "code postal": "postal-code",
    "ville": "address-level2",
    "pays": "country-name",
    "telephone": "tel",
    "votre email": "email"
  };

  function normaliser(texte) {
    return (texte || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function appliquerAutocomplete() {
    document.querySelectorAll(
      '#form [data-role="control"]'
    ).forEach(function (bloc) {

      const label = bloc.querySelector(
        'label[data-role="label"]'
      );

      const champ = bloc.querySelector(
        'input[data-role="i123-input"], input[type="email"], input[type="tel"]'
      );

      if (!label || !champ) return;

      const nom = normaliser(label.textContent);
      const valeur = correspondances[nom];

      if (valeur && champ.getAttribute("autocomplete") !== valeur) {
        champ.setAttribute("autocomplete", valeur);
      }
    });
  }

  let programmation = false;

  function planifier() {
    if (programmation) return;
    programmation = true;

    requestAnimationFrame(function () {
      programmation = false;
      appliquerAutocomplete();
    });
  }

  function initialiser() {
    appliquerAutocomplete();

    const formulaire = document.querySelector("#form");
    if (!formulaire) return;

    const observateur = new MutationObserver(planifier);
    observateur.observe(formulaire, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiser);
  } else {
    initialiser();
  }
})();
