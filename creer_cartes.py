import streamlit as st
import json
import os
from uuid import uuid4
import base64

FICHIER_BASE = "data/cartes_base.json"
os.makedirs("data", exist_ok=True)

# 📥 Chargement
def charger_cartes():
    if not os.path.exists(FICHIER_BASE):
        return []
    with open(FICHIER_BASE, "r", encoding="utf-8") as f:
        return json.load(f)

# 💾 Sauvegarde
def sauvegarder_cartes(cartes):
    with open(FICHIER_BASE, "w", encoding="utf-8") as f:
        json.dump(cartes, f, indent=2, ensure_ascii=False)

# 📤 Exporter en base64 lien téléchargeable
def generer_lien_telechargement(data, nom_fichier):
    b64 = base64.b64encode(json.dumps(data, indent=2, ensure_ascii=False).encode()).decode()
    return f'<a href="data:file/json;base64,{b64}" download="{nom_fichier}">📥 Télécharger ce thème</a>'

# 🧠 Chargement initial
cartes = charger_cartes()

# 📋 Interface
st.title("📚 Base de données des cartes")

with st.form("ajout_carte"):
    nom = st.text_input("Nom de la carte")
    theme = st.text_input("Thème")
    couleur = st.color_picker("Couleur associée au thème", "#f39c12")
    submit = st.form_submit_button("Ajouter la carte")

    if submit:
        if nom.strip() and theme.strip():
            carte = {
                "id": str(uuid4()),
                "nom": nom.strip(),
                "theme": theme.strip(),
                "couleur": couleur
            }
            cartes.append(carte)
            sauvegarder_cartes(cartes)
            st.success(f"Carte '{nom}' ajoutée avec succès.")
            st.rerun()
        else:
            st.error("Veuillez remplir le nom et le thème.")

# 🔍 Filtrage
themes_existants = sorted(set(c["theme"] for c in cartes))
filtre_theme = st.selectbox("🎯 Filtrer par thème", ["Tous"] + themes_existants)

cartes_affichees = cartes if filtre_theme == "Tous" else [c for c in cartes if c["theme"] == filtre_theme]

# 📤 Export du thème filtré
if filtre_theme != "Tous" and cartes_affichees:
    st.markdown(generer_lien_telechargement(cartes_affichees, f"{filtre_theme}.json"), unsafe_allow_html=True)

# 🃏 Affichage en grille 3 colonnes
st.subheader(f"{len(cartes_affichees)} carte(s) affichée(s)")

cols = st.columns(3)

for i, carte in enumerate(cartes_affichees):
    nom = carte['nom']
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
                overflow: hidden;
            ">
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
                    word-wrap: break-word;
                ">
                    {nom}
                </div>
                <div style="
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 18px;
                    color: #666;
                ">
                    {carte['theme']}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )

        # 🗑️ Suppression
        if st.button(f"🗑️ Supprimer", key=f"del_{carte['id']}"):
            cartes = [c for c in cartes if c["id"] != carte["id"]]
            sauvegarder_cartes(cartes)
            st.success(f"Carte supprimée : {nom}")
            st.rerun()
