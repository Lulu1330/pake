import React from "react";

export default function MentionsLegales() {
  const updated = new Date().toLocaleDateString("fr-FR");

  return (
    <main className="max-w-3xl mx-auto p-6 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-200">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-white">📄 Mentions légales</h1>
        <small className="text-sm text-gray-600 dark:text-gray-400">Mis à jour le {updated}</small>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Éditeur du site</h2>
        <p className="mt-2">
          Ce site est édité à titre personnel et n’a pas de vocation commerciale. Pour toute question ou demande, vous pouvez
          contacter l’éditeur à l’adresse suivante :
        </p>
        <p className="mt-2 font-medium">
          <a href="mailto:support@pake-de-cartes.fr" className="text-indigo-600 hover:underline dark:text-white">support@pake-de-cartes.fr</a>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Propriété intellectuelle</h2>
        <p className="mt-2">
          L’ensemble des éléments présents sur ce site (textes, images, graphismes, code, interface) est protégé par le droit
          d’auteur et les lois relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou
          exploitation, totale ou partielle, sans autorisation préalable de l’éditeur, est interdite.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Responsabilité</h2>
        <p className="mt-2">
          L’éditeur s’efforce de fournir des informations fiables et de maintenir l’application opérationnelle, mais ne peut
          garantir l’absence totale d’erreurs, d’omissions ou de bugs. L’éditeur ne saurait être tenu responsable des
          dommages directs ou indirects, pertes de données ou interruptions liés à l’utilisation de l’application.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Marques</h2>
        <p className="mt-2">
          <em>Time’s Up®</em> est une marque déposée appartenant à Asmodee. Ce site propose une alternative d’inspiration et
          n’est ni affilié ni approuvé par Asmodee.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Données personnelles</h2>
        <p className="mt-2">
          Ce site ne collecte pas de données personnelles sensibles à des fins commerciales. Si vous soumettez des informations
          (par exemple via un formulaire de contact), elles seront utilisées uniquement pour répondre à votre demande. Pour
          toute question concernant la confidentialité, contactez-nous à l’adresse indiquée ci‑dessus.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-white">Contact</h2>
        <p className="mt-2">
          Pour toute question légale, remarque ou demande de suppression de contenu, envoyez un message à : 
          <a href="mailto:support@pake-de-cartes.fr" className="ml-1 text-indigo-600 hover:underline dark:text-white">support@pake-de-cartes.fr</a>.
        </p>
      </section>
    </main>
  );
}
