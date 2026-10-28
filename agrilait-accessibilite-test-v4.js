
(function () {
  "use strict";

  // Agrilait V4 - Diagnostic des regroupements
  // Aucun deplacement des champs

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

  function diagnostiquer() {
    const formulaire = document.querySelector("#form");
    if (!formulaire) {
      console.warn("Agrilait V4 : formulaire introuvable");
      return false;
    }

    const resultats = [];

    formulaire.querySelectorAll(
      '[data-role="control"]'
    ).forEach(function (bloc) {
      const label = bloc.querySelector(
        'label[data-role="label"]'
      );
      if (!label) return;

      const nom = normaliser(label.textContent);
      const valeur = correspondances[nom];
      if (!valeur) return;

      const input = bloc.querySelector(
        'input[data-role="i123-input"], input[type="email"], input[type="tel"]'
      );

      // Conservation des attributs autocomplete
      if (input) {
        input.setAttribute("autocomplete", valeur);
      }

      const ligne = bloc.parentElement;
      const parent = ligne ? ligne.parentElement : null;

      resultats.push({
        champ: nom,
        trouve: !!input,
        autocomplete: input ?
          input.getAttribute("autocomplete") : "",
        ligne: ligne ?
          ligne.getAttribute("data-role") : "",
        parent: parent ?
          parent.getAttribute("data-role") : "",
        enfants: ligne ?
          ligne.querySelectorAll(
            ':scope > [data-role="control"]'
          ).length : 0
      });
    });

    console.info(
      "Agrilait V4 : diagnostic des coordonnees"
    );
    console.table(resultats);

    console.info(
      "Agrilait V4 : champs identifies : " +
      resultats.length + "/8"
    );

    return resultats.length === 8;
  }

  function initialiser() {
    diagnostiquer();

    // Nouveau diagnostic en cas de rendu differe
    setTimeout(diagnostiquer, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiser
    );
  } else {
    initialiser();
  }
})();
