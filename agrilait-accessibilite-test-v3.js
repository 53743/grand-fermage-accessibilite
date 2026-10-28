
(function () {
  "use strict";

  // Agrilait - Test accessibilite V3
  // Test du regroupement "Vos coordonnees"

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

  const noms = Object.keys(correspondances);

  function normaliser(texte) {
    return (texte || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\*/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function trouverChamps() {
    return Array.from(
      document.querySelectorAll(
        '#form [data-role="control"]'
      )
    ).map(function (bloc) {
      const label = bloc.querySelector(
        'label[data-role="label"]'
      );

      return {
        bloc: bloc,
        nom: label ? normaliser(label.textContent) : ""
      };
    });
  }

  function autocomplete() {
    trouverChamps().forEach(function (item) {
      const valeur = correspondances[item.nom];
      if (!valeur) return;

      const input = item.bloc.querySelector(
        'input[data-role="i123-input"], input[type="email"], input[type="tel"]'
      );

      if (input) {
        input.setAttribute("autocomplete", valeur);
      }
    });
  }

  function creerRegroupement() {
    if (document.getElementById("agrilait-coordonnees")) {
      return;
    }

    const champs = trouverChamps();
    const controles = noms.map(function (nom) {
      return champs.find(function (item) {
        return item.nom === nom;
      });
    });

    if (controles.some(function (item) { return !item; })) {
      return;
    }

    const lignes = controles.map(function (item) {
      return item.bloc.parentElement;
    });

    const parent = lignes[0].parentElement;

    // Ne pas deplacer les champs si leur structure
    // n'est pas celle attendue.
    if (!lignes.every(function (ligne) {
      return ligne.parentElement === parent &&
        ligne.matches(
          '[data-role="container"][data-type="virtual-form-table-row"]'
        ) &&
        ligne.querySelectorAll(
          ':scope > [data-role="control"]'
        ).length === 1;
    })) {
      console.warn(
        "Agrilait V3 : regroupement non applique - structure differente."
      );
      return;
    }

    const elements = Array.from(parent.children);
    const positions = lignes.map(function (ligne) {
      return elements.indexOf(ligne);
    });

    const debut = Math.min.apply(null, positions);

    // Les huit lignes doivent etre consecutives et
    // dans l'ordre attendu.
    if (!positions.every(function (p, i) {
      return p === debut + i;
    })) {
      console.warn(
        "Agrilait V3 : regroupement non applique - lignes non consecutives."
      );
      return;
    }

    const fieldset = document.createElement("fieldset");
    fieldset.id = "agrilait-coordonnees";

    const legend = document.createElement("legend");
    legend.textContent = "Vos coordonnées";

    fieldset.appendChild(legend);

    fieldset.style.cssText = [
      "box-sizing:border-box",
      "width:100%",
      "min-width:0",
      "margin:12px 0 20px",
      "padding:16px 12px",
      "border:2px solid #245c86",
      "border-radius:6px"
    ].join(";");

    legend.style.cssText = [
      "font-size:1.2em",
      "font-weight:700",
      "color:#114271",
      "padding:0 8px"
    ].join(";");

    parent.insertBefore(fieldset, lignes[0]);

    lignes.forEach(function (ligne) {
      fieldset.appendChild(ligne);
    });

    console.info(
      "Agrilait V3 : regroupement Vos coordonnees ajoute."
    );
  }

  function initialiser() {
    autocomplete();
    creerRegroupement();

    const formulaire = document.querySelector("#form");
    if (!formulaire) return;

    let prevu = false;
    const observateur = new MutationObserver(function () {
      if (prevu) return;
      prevu = true;

      requestAnimationFrame(function () {
        prevu = false;
        autocomplete();
      });
    });

    observateur.observe(formulaire, {
      childList: true,
      subtree: true
    });
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
