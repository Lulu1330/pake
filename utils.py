import json
import os
import random

def charger_cartes():
    path = os.path.join(os.path.dirname(__file__), "cartes_base.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def tirer_cartes(cartes, themes_choisis, nb_cartes):
    cartes_filtrees = [c for c in cartes if c["theme"] in themes_choisis]
    nb = min(nb_cartes, len(cartes_filtrees))
    return random.sample(cartes_filtrees, nb)

def remplacer_carte(cartes, tirage, index, mises_de_cote):
    carte_actuelle = tirage[index]
    disponibles = [
        c for c in cartes
        if c not in tirage
        and c not in mises_de_cote
        and c['theme'] == carte_actuelle['theme']
    ]
    return random.choice(disponibles) if disponibles else None
