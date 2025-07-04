import streamlit as st
import sqlite3
from uuid import uuid4
import base64
import os

# 📁 Dossier pour la base
os.makedirs("pake", exist_ok=True)
DB_PATH = "cartes.db"

# 🔧 Initialisation de la base
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS cartes (
            id TEXT PRIMARY KEY,
            nom TEXT NOT NULL,
            theme TEXT NOT NULL,
            couleur TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# 📥 Récupérer toutes les cartes
def charger_cartes():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, nom, theme, couleur FROM cartes")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "nom": r[1], "theme": r[2], "couleur": r[3]} for r in rows]

# 💾 Ajouter une carte
def ajouter_carte(id, nom, theme, couleur):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO cartes (id, nom, theme, couleur) VALUES (?, ?, ?, ?)", (id, nom, theme, couleur))
    conn.commit()
    conn.close()

# 🗑️ Supprimer une carte
def supprimer_carte(id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DELETE FROM cartes WHERE id = ?", (id,))
    conn.commit()
    conn.close()

# 📤 Générer un lien de téléchargement
def generer_lien_telechargement(data, nom_fichier):
    b64 = base64.b64encode(str(data).encode()).decode()
    return f'<a href="data:file/json;base64,{b64}" download="{nom_fichier}">📥 Télécharger ce thème</a>'

# 🚀 Lancement
init_db()
cartes = charger_cartes()

# 📋 Interface
st.title("📚 Base de données des cartes")

with st.form("ajout_carte"):
    nom = st.text_input("Nom de la carte")
    theme = st.text_input("Thème")
    couleur = st.color_picker("Couleur associée", "#f39c12")
    submit = st.form_submit_button("Ajouter la carte")

    if submit:
        if nom.strip() and theme.strip():
            ajouter_carte(str(uuid4()), nom.strip(), theme.strip(), couleur)
            st.success(f"Carte '{nom}' ajoutée avec succès.")
            st.rerun()
        else:
            st.error("Veuillez remplir le nom et le thème.")

# 🔍 Filtrage
themes_existants = sorted(set(c["theme"] for c in cartes))
filtre_theme = st.selectbox("🎯 Filtrer par thème", ["Tous"] + themes_existants)

cartes_affichees = cartes if filtre_theme == "Tous" else [c for c in cartes if c["theme"] == filtre_theme]

# 📤 Export JSON
if filtre_theme != "Tous" and cartes_affichees:
    st.markdown(generer_lien_telechargement(cartes_affichees, f"{filtre_theme}.json"), unsafe_allow_html=True)

# 🃏 Affichage en grille
st.subheader(f"{len(cartes_affichees)} carte(s) affichée(s)")
cols = st.columns(3)

for i, carte in enumerate(cartes_affichees):
    nom = carte["nom"]
    taille = 35
    if len(nom) > 15:
        taille = 20
    elif len(nom) > 10:
        taille = 28

    with cols[i % 3]:
        st.markdown(
            f"""
            <div style="
                border: 4px solid {carte['couleur']};
                border-radius: 16px;
                margin: 10px 0;
                background-color: #ffffff;
                width: 100%;
                height: 300px;
                position: relative;
                box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
                overflow: hidden;">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    font-size: {taille}px;
                    font-weight: bold;
                    color: {carte['couleur']};
                    padding: 0 10px;
                    word-wrap: break-word;">
                    {nom}
                </div>
                <div style="
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 18px;
                    color: #666;">
                    {carte['theme']}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        if st.button("🗑️ Supprimer", key=f"del_{carte['id']}"):
            supprimer_carte(carte["id"])
            st.success(f"Carte supprimée : {carte['nom']}")
            st.rerun()
