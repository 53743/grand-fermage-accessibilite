
(function () {
  "use strict";

  // Agrilait - Test accessibilite V5
  // Premier regroupement : Vos coordonnees

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

  function identifierChamps() {
    return Array.from(
      document.querySelectorAll('#form [data-role="control"]')
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

  function appliquerAutocomplete(champs) {
    champs.forEach(function (item) {
      const valeur = correspondances[item.nom];
      if (!valeur) return;

      const input = item.bloc.querySelector(
        'input[data-role="i123-input"], input[type="email"], input[type="tel"]'
      );

      if (input && input.getAttribute("autocomplete") !== valeur) {
        input.setAttribute("autocomplete", valeur);
      }
    });
  }

  function creerRegroupement(champs) {
    if (document.getElementById("agrilait-coordonnees")) {
      return;
    }

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

    if (!parent || !lignes.every(function (ligne) {
      return ligne.parentElement === parent &&
        ligne.getAttribute("data-role") === "container";
    })) {
      console.warn(
        "Agrilait V5 : structure des coordonnees incompatible"
      );
      return;
    }

    const enfants = Array.from(parent.children);
    const positions = lignes.map(function (ligne) {
      return enfants.indexOf(ligne);
    });

    const debut = positions[0];

    if (!positions.every(function (position, index) {
      return position === debut + index;
    })) {
      console.warn(
        "Agrilait V5 : les champs ne sont pas consecutifs"
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
      "margin:16px 0 22px",
      "padding:18px 12px",
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
      "Agrilait V5 : regroupement Vos coordonnees ajoute"
    );
  }

  function executer() {
    const champs = identifierChamps();

    appliquerAutocomplete(champs);
    creerRegroupement(champs);
  }

  function initialiser() {
    const formulaire = document.querySelector("#form");
    if (!formulaire) return;

    let prevu = false;

    const observateur = new MutationObserver(function () {
      if (prevu) return;
      prevu = true;

      requestAnimationFrame(function () {
        prevu = false;
        executer();
      });
    });

    observateur.observe(formulaire, {
      childList: true,
      subtree: true
    });

    executer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiser);
  } else {
    initialiser();
  }
})();
