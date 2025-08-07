import React from "react";

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-left font-sans text-gray-800 dark:text-gray-300">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 dark:text-white">🔐 Politique de Confidentialité</h1>

      <section className="mb-6">
        <p>
          Ce site respecte votre vie privée. Aucune donnée personnelle n’est collectée sans votre consentement.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Données personnelles</h2>
        <p>
          Aucune donnée personnelle (nom, email, adresse IP…) n’est enregistrée, stockée ou partagée.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Contact</h2>
        <p>
          Pour toute question relative à la confidentialité, vous pouvez nous écrire à :{" "}
          <a href="mailto:support@pake-de-cartes.fr" className="text-indigo-600 underline">
            support@pake-de-cartes.fr
          </a>
        </p>
      </section>
    </div>
  );
}
