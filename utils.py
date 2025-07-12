import os
import random
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "cartes.db")

# 📥 Connexion et chargement des cartes depuis SQLite
def charger_cartes():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # pour accéder aux colonnes par nom
    cursor = conn.cursor()
    cursor.execute("SELECT id, carte, theme, couleur FROM cartes")
    cartes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return cartes

# 🎯 Tirage de cartes filtrées par thème
def tirer_cartes(cartes, themes_choisis, nb_cartes):
    cartes_filtrees = [c for c in cartes if c["theme"] in themes_choisis]
    nb = min(nb_cartes, len(cartes_filtrees))
    return random.sample(cartes_filtrees, nb)

# 🔄 Remplacer une carte du tirage par une autre du même thème
def remplacer_carte(cartes, tirage, index, mises_de_cote):
    carte_actuelle = tirage[index]
    disponibles = [
        c for c in cartes
        if c not in tirage
        and c not in mises_de_cote
    ]
    return random.choice(disponibles) if disponibles else None