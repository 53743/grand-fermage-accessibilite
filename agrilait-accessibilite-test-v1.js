
(function () {
  "use strict";

  const champs = {
    "votre nom": "family-name",
    "votre prénom": "given-name",
    "adresse": "street-address",
    "code postal": "postal-code",
    "ville": "address-level2",
    "pays": "country-name",
    "téléphone": "tel",
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

  const correspondances = Object.fromEntries(
    Object.entries(champs).map(([nom, valeur]) => [
      normaliser(nom), valeur
    ])
  );

  function appliquerAutocomplete() {
    document.querySelectorAll(
      '#form [data-role="control"]'
    ).forEach(function (bloc) {

      const label = bloc.querySelector(
        '[data-role="label-column"] label, label[data-role="label"]'
      );

      const champ = bloc.querySelector(
        '[data-role="input-container"] input'
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      appliquerAutocomplete();
      observer();
    });
  } else {
    appliquerAutocomplete();
    observer();
  }

  function observer() {
    const formulaire = document.querySelector("#form");
    if (!formulaire) return;

    const observateur = new MutationObserver(planifier);
    observateur.observe(formulaire, {
      childList: true,
      subtree: true
    });
  }
})();
