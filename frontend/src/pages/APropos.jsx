import React from "react";

export default function APropos() {
    return (
    <div className="max-w-3xl mx-auto p-6 text-left font-sans text-gray-800 dark:text-gray-300">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 dark:text-white">🃏 À propos de Pake de Cartes</h1>

      <section className="mb-6">
        <p className="text-lg">
          Bienvenue sur <strong>Jeu de Cartes</strong>, une application web simple, ludique et conçue pour animer vos soirées, vos cours ou vos temps libres !
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">🎯 Objectif du jeu</h2>
        <p>
          Le but est de <strong>faire deviner un mot</strong> à son équipe dans un temps limité. Chaque bonne réponse rapporte un point.
          À la fin, l’équipe avec le plus de points remporte la partie ! 
          (ce n'est qu'un exemple de jeu, vous pouvez faire ce que vous voulez qui nécessite un paquet de carte)
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">👥 Pour qui ?</h2>
        <p>
          Ce jeu s’adresse à tous :
          familles, amis… ou toute personne qui aime jouer !
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">💡 Pourquoi ce jeu ?</h2>
        <p>
          Nous voulions un jeu <strong>rapide, sans préparation, sans inscription</strong>, accessible à tous et centré sur le plaisir de jouer ensemble. Le numérique permet de varier les parties à l’infini.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">🛠️ Techniquement</h2>
        <p>
          L’application est développée avec <strong>React</strong> pour l’interface, et un backend simple en <strong>Flask (Python)</strong> pour gérer le tirage aléatoire des cartes.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 mb-2 dark:text-white">✉️ Une suggestion ? Un bug ?</h2>
        <p>
          Vos retours sont toujours les bienvenus ! Écrivez-nous à :
          <a
            href="mailto:support@pake-de-cartes.fr"
            className="text-indigo-600 hover:underline font-semibold ml-1 dark:text-white"
          >
            support@pake-de-cartes.fr
          </a>
        </p>
      </section>
    </div>
  );
}