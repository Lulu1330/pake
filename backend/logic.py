import sqlite3
import random

def charger_cartes():
    conn = sqlite3.connect("cartes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT carte, theme FROM cartes")
    cartes = [{"carte": row[0], "theme": row[1]} for row in cursor.fetchall()]
    conn.close()
    return cartes

def tirer_cartes(themes, nb):
    toutes = charger_cartes()
    filtrées = [c for c in toutes if c["theme"] in themes] if themes else toutes
    return random.sample(filtrées, min(nb, len(filtrées)))
