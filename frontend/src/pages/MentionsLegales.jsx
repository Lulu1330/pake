import React from "react";

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-left font-sans text-gray-800 dark:text-gray-300">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 dark:text-white">📄 Mentions Légales</h1>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Éditeur du site</h2>
        <p>
          Ce site est édité à titre personnel et n’a pas vocation commerciale.
          Pour toute question, vous pouvez contacter l’éditeur à :{" "}
          <a href="support@pake-de-cartes.fr" className="text-indigo-600 underline">
            support@pake-de-cartes.fr
          </a>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Propriété intellectuelle</h2>
        <p>
          Tous les éléments de ce site (textes, images, interface) sont protégés par le droit d’auteur. Toute reproduction partielle ou totale est interdite sans autorisation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Responsabilité</h2>
        <p>
          L’éditeur ne saurait être tenu responsable d’éventuels dysfonctionnements ou erreurs liées à l’utilisation de l’application.
        </p>
      </section>
    </div>
  );
}
