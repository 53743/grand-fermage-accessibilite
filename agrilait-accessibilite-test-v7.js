
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

  // Agrilait V6 - Regroupement Votre demande

  function creerRegroupementDemande(champs) {
    if (document.getElementById("agrilait-demande")) {
      return;
    }

    function chercher(nom) {
      return champs.find(function (item) {
        return item.nom === nom;
      });
    }

    const premier = chercher("produit concerne");
    const dernier = chercher("votre message");

    // Attendre que les champs soient disponibles
    if (!premier || !dernier) return;

    const debutLigne = premier.bloc.parentElement;
    const finLigne = dernier.bloc.parentElement;

    if (!debutLigne || !finLigne) return;

    const parent = debutLigne.parentElement;

    // Ne pas modifier une structure inattendue
    if (!parent || finLigne.parentElement !== parent) {
      console.warn(
        "Agrilait V6 : structure incompatible"
      );
      return;
    }

    const elements = Array.from(parent.children);
    const debut = elements.indexOf(debutLigne);
    let fin = elements.indexOf(finLigne);

    if (debut < 0 || fin < debut) return;

    // Inclure la piece jointe si elle suit
    // immediatement le champ message.
    const suivant = elements[fin + 1];

    if (
      suivant &&
      suivant.querySelector(
        'input[type="file"], [data-type="file"], [data-type="file-upload"]'
      )
    ) {
      fin++;
    }

    const lignes = elements.slice(debut, fin + 1);

    // Eviter de regrouper un autre fieldset
    // ou des champs de consentement.
    if (lignes.some(function (ligne) {
      return ligne.matches("fieldset") ||
        !!ligne.querySelector("fieldset");
    })) {
      console.warn(
        "Agrilait V6 : regroupement non applique"
      );
      return;
    }

    const fieldset = document.createElement("fieldset");
    fieldset.id = "agrilait-demande";

    const legend = document.createElement("legend");
    legend.textContent = "Votre demande";

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

    parent.insertBefore(fieldset, debutLigne);

    lignes.forEach(function (ligne) {
      fieldset.appendChild(ligne);
    });

    console.info(
      "Agrilait V6 : regroupement Votre demande ajoute"
    );
  }

  
  
  function executer() {
    const champs = identifierChamps();

    appliquerAutocomplete(champs);
    creerRegroupement(champs);
    creerRegroupementDemande(champs);

    // Troisieme regroupement Agrilait V7
    creerRegroupementDonnees();
  }
    const lignes = Array.from(
      formulaire.querySelectorAll(
        '[data-role="container"][data-type="virtual-form-table-row"]'
      )
    );

    function normaliserTexte(texte) {
      return (texte || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ");
    }

    const debut = lignes.find(function (ligne) {
      return normaliserTexte(ligne.textContent)
        .includes("les champs marques d'une etoile");
    });

    const fin = lignes.find(function (ligne) {
      return normaliserTexte(ligne.textContent)
        .includes("reclamation abusive ou frauduleuse");
    });

    if (!debut || !fin) {
      console.info(
        "Agrilait V7 : informations de confidentialite non trouvees"
      );
      return;
    }

    const parent = debut.parentElement;

    if (!parent || fin.parentElement !== parent) {
      console.warn(
        "Agrilait V7 : structure des donnees incompatible"
      );
      return;
    }

    const enfants = Array.from(parent.children);
    const premier = enfants.indexOf(debut);
    const dernier = enfants.indexOf(fin);

    if (premier < 0 || dernier < premier) return;

    const elements = enfants.slice(premier, dernier + 1);

    // Ne jamais inclure le CAPTCHA ou le bouton Envoyer
    if (elements.some(function (element) {
      return !!element.querySelector(
        'iframe[src*="recaptcha"], [data-type="form-captcha"], button[type="submit"]'
      );
    })) {
      console.warn(
        "Agrilait V7 : CAPTCHA ou envoi detecte, regroupement annule"
      );
      return;
    }

    const fieldset = document.createElement("fieldset");
    fieldset.id = "agrilait-donnees";

    const legend = document.createElement("legend");
    legend.textContent = "Protection de vos données personnelles";

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

    parent.insertBefore(fieldset, debut);

    elements.forEach(function (element) {
      fieldset.appendChild(element);
    });

    console.info(
      "Agrilait V7 : regroupement Protection des donnees ajoute"
    );
  }

  function executer() {
    const champs = identifierChamps();

    appliquerAutocomplete(champs);
    creerRegroupement(champs);

    // Nouveau regroupement Agrilait V6
    creerRegroupementDemande(champs);
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

  
  // Supprimer uniquement la bordure du bloc informatif Agrilait
  function supprimerBordureInformation() {
    const bloc = document.querySelector(
      '#form [data-role="control"][data-id="122047806"]'
    );

    if (!bloc) return;

    const ligne = bloc.closest(
      '[data-role="container"][data-type="virtual-form-table-row"]'
    );

    [bloc, ligne].filter(Boolean).forEach(function (element) {
      element.style.setProperty("border", "none", "important");
      element.style.setProperty("outline", "none", "important");
      element.style.setProperty("box-shadow", "none", "important");
    });
  }

  supprimerBordureInformation();
  setTimeout(supprimerBordureInformation, 1500);

})();
