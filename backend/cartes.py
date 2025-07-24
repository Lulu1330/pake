import random
import sqlite3

def charger_cartes():
    conn = sqlite3.connect("cartes.db")
    conn.text_factory = lambda x: str(x, 'utf-8', 'ignore')
    cursor = conn.cursor()
    cursor.execute("SELECT carte, theme FROM cartes")
    cartes = [{"carte": row[0], "theme": row[1], "couleur": "#222"} for row in cursor.fetchall()]
    conn.close()
    return cartes

def tirer_cartes(cartes, themes, nb):
    filtres = [c for c in cartes if c["theme"] in themes]
    return random.sample(filtres, min(nb, len(filtres)))

def remplacer_carte(cartes, slides, index, mises_de_cote):
    disponibles = [c for c in cartes if c not in slides and c not in mises_de_cote]
    return random.choice(disponibles) if disponibles else None

def get_themes():
    conn = sqlite3.connect("cartes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT theme FROM cartes")
    themes = [row[0] for row in cursor.fetchall()]
    conn.close()
    return themes
