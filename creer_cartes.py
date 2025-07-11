import streamlit as st
import sqlite3
import os

DB_PATH = "cartes.db"

# 🔧 Initialisation de la base
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS cartes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carte TEXT NOT NULL,
            theme TEXT NOT NULL,
            couleur TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# 📥 Charger les cartes
def charger_cartes():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, carte, theme, couleur FROM cartes")
    rows = c.fetchall()
    conn.close()
    return rows

# ➕ Ajouter une carte
def ajouter_carte(carte, theme, couleur):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO cartes (carte, theme, couleur) VALUES (?, ?, ?)", (carte, theme, couleur))
    conn.commit()
    conn.close()

# 🔄 Modifier une carte
def modifier_carte(id, carte, theme, couleur):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE cartes SET carte = ?, theme = ?, couleur = ? WHERE id = ?", (carte, theme, couleur, id))
    conn.commit()
    conn.close()

# ❌ Supprimer une carte
def supprimer_carte(id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM cartes WHERE id = ?", (id,))
    conn.commit()
    conn.close()

# 🚀 App démarrage
init_db()
st.title("🃏 Gestion des Cartes - cartes.db")

# 📋 Formulaire d’ajout
st.subheader("➕ Ajouter une carte")
with st.form("form_ajout"):
    carte = st.text_input("Nom de la carte")
    theme = st.text_input("Thème")
    couleur = st.color_picker("Couleur")
    submit = st.form_submit_button("Ajouter")
    if submit:
        if carte.strip() and theme.strip():
            cartes_existantes = charger_cartes()
            noms_existants = [c[1].strip().lower() for c in cartes_existantes]
            
            if carte.strip().lower() in noms_existants:
                st.warning(f"⚠️ La carte « {carte} » existe déjà dans la base.")
            else:
                ajouter_carte(carte.strip(), theme.strip(), couleur)
                st.success("Carte ajoutée.")
                st.rerun()

        else:
            st.error("Nom et thème requis.")

# 🔍 Barre de recherche
st.subheader("🔍 Filtrer les cartes")
filtre_carte = st.text_input("Filtrer par carte (partiel)")
filtre_theme = st.text_input("Filtrer par thème (exact)")
filtre_couleur = st.text_input("Filtrer par couleur (code hex ou nom partiel)")

# 📋 Cartes avec filtres
cartes = charger_cartes()
cartes_filtres = [
    c for c in cartes
    if filtre_carte.lower() in c[1].lower()
    and (filtre_theme.strip().lower() == c[2].strip().lower() if filtre_theme.strip() else True)
    and filtre_couleur.lower() in c[3].lower()
]

# 📄 Pagination
CARDS_PAR_PAGE = 10
page = st.number_input("📄 Page", min_value=1, step=1, value=1)

# 📋 Affichage des cartes filtrées
cartes = charger_cartes()
cartes_filtres = [
    c for c in cartes
    if filtre_carte.lower() in c[1].lower()
    and filtre_theme.lower() in c[2].lower()
    and filtre_couleur.lower() in c[3].lower()
]

# Appliquer pagination
total_pages = max(1, (len(cartes_filtres) - 1) // CARDS_PAR_PAGE + 1)
page = min(page, total_pages)
debut = (page - 1) * CARDS_PAR_PAGE
fin = debut + CARDS_PAR_PAGE
cartes_page = cartes_filtres[debut:fin]

st.caption(f"Affichage des cartes {debut + 1} à {min(fin, len(cartes_filtres))} sur {len(cartes_filtres)} (Page {page}/{total_pages})")

# 🛠️ Édition groupée des cartes affichées
modifs = {}
for id, carte, theme, couleur in cartes_page:
    with st.expander(f"🆔 {id} | {carte}"):
        new_carte = st.text_input("Carte", carte, key=f"carte_{id}")
        new_theme = st.text_input("Thème", theme, key=f"theme_{id}")
        new_couleur = st.color_picker("Couleur", couleur, key=f"couleur_{id}")
        supprimer = st.checkbox("🗑️ Supprimer cette carte", key=f"del_{id}")
        modifs[id] = {
            "carte": new_carte,
            "theme": new_theme,
            "couleur": new_couleur,
            "supprimer": supprimer
        }

if st.button("💾 Enregistrer toutes les modifications"):
    modif_count = 0
    suppr_count = 0
    for id, infos in modifs.items():
        if infos["supprimer"]:
            supprimer_carte(id)
            suppr_count += 1
        else:
            modifier_carte(id, infos["carte"], infos["theme"], infos["couleur"])
            modif_count += 1
    st.success(f"{modif_count} carte(s) modifiée(s), {suppr_count} supprimée(s).")
    st.rerun()

themes_uniques = sorted(set(c[2] for c in cartes))
filtre_theme = st.selectbox("🎯 Thème", [""] + themes_uniques)
