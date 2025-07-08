import streamlit as st
import random
from utils import charger_cartes, tirer_cartes, remplacer_carte

import sqlite3

def charger_themes():
    conn = sqlite3.connect("cartes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT theme FROM cartes")
    themes = [row[0] for row in cursor.fetchall()]
    conn.close()
    return sorted(themes)


# Chargement des données
cartes = charger_cartes()
st.set_page_config(layout="wide")
st.sidebar.title("🎛️ Options de tirage")


# Initialisation des compteurs d'équipes
if 'scores' not in st.session_state:
    st.session_state['scores'] = {"Team 1": 0, "Team 2": 0}
if 'team_names' not in st.session_state:
    st.session_state['team_names'] = {"Team 1": "Team 1", "Team 2": "Team 2"}
if 'last_team_action' not in st.session_state:
    st.session_state['last_team_action'] = None  # Ex: ("Team 1", carte)
if 'cartes_team1' not in st.session_state:
    st.session_state['cartes_team1'] = []
if 'cartes_team2' not in st.session_state:
    st.session_state['cartes_team2'] = []


st.sidebar.markdown("### Choix des thèmes")

# Ajout de l'option "Tout"
tout_selectionner = st.sidebar.checkbox("✅ Tout sélectionner", value=False)

# Liste des thèmes cochables
themes_choisis = []
themes_disponibles = charger_themes()

if tout_selectionner:
    themes_choisis = themes_disponibles
else:
    for theme in themes_disponibles:
        if st.sidebar.checkbox(theme):
            themes_choisis.append(theme)

# Nombre de cartes
nb_cartes = st.sidebar.number_input("Nombre de cartes à tirer :", min_value=1, value=10)


# Bouton de tirage
if st.sidebar.button("🎲 Lancer le tirage"):
    st.session_state['slides'] = tirer_cartes(cartes, themes_choisis, nb_cartes)
    st.session_state['index'] = -1
    st.session_state['mise_de_cote'] = []

# Affichage et navigation
index = st.session_state.get('index', -1)
slides = st.session_state.get('slides', [])

# Première carte
if index == -1 and slides:
    st.markdown("## 👀 Prêt ? Cliquez pour afficher la première carte")
    if st.button("▶️ Commencer"):
        st.session_state['index'] = 0
        st.rerun()

# Affichage d'une carte
if 0 <= index < len(slides):
    carte = slides[index]
    st.markdown(f"""
        <div style="display: flex; justify-content: center; align-items: center; height: 350px;">
            <div style="
                border: 4px solid {carte['couleur']};
                border-radius: 16px;
                padding: 24px;
                background-color: #fff;
                width: 240px;
                height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                font-weight: bold;
                font-size: calc(20px + 1vw);
                color: {carte['couleur']};
                box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.1);
            ">
                {carte['carte']}
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
    """, unsafe_allow_html=True)

    # Navigation + actions
    col1, col2, col3 = st.columns([1, 2, 1])
    with col1:
        if st.button("◀️ Précédente") and index > 0:
            st.session_state['index'] -= 1
            st.rerun()

    with col3:
        if st.button("▶️ Suivante") and index < len(slides) - 1:
            st.session_state['index'] += 1
            st.rerun()

    with col2:

        if st.button("🔄 Remplacer cette carte avec une autre carte de la pioche"):
            nouvelle = remplacer_carte(cartes, slides, index, st.session_state.get("mise_de_cote", []))
            if nouvelle:
                st.session_state['slides'][index] = nouvelle
                st.rerun()
            else:
                st.warning("Aucune autre carte disponible pour remplacement.")

    with col2:
        team1 = st.session_state['team_names']["Team 1"]
        team2 = st.session_state['team_names']["Team 2"]
        
        if st.button("🏅 Envoyer à Team 1"):
            st.session_state['cartes_team1'].append(carte)
            st.session_state['last_team_action'] = ("Team 1", carte)
            del st.session_state['slides'][index]
            st.session_state['index'] = min(st.session_state['index'], len(st.session_state['slides']) - 1)
            st.session_state['scores']['Team 1'] += 1
            st.rerun()


        if st.button("🏅 Envoyer à Team 2"):
            st.session_state['cartes_team2'].append(carte)
            st.session_state['last_team_action'] = ("Team 2", carte)
            del st.session_state['slides'][index]
            st.session_state['index'] = min(st.session_state['index'], len(st.session_state['slides']) - 1)
            st.session_state['scores']['Team 2'] += 1
            st.rerun()



# Toggle pour toutes les cartes
if 'show_all_cards' not in st.session_state:
    st.session_state['show_all_cards'] = False

toggle = st.button("🔽 Voir toutes les cartes du tirage" if not st.session_state['show_all_cards'] else "🔼 Masquer les cartes")
if toggle:
    st.session_state['show_all_cards'] = not st.session_state['show_all_cards']

if st.session_state['show_all_cards']:
    st.markdown("## 🃏 Cartes du tirage")
    cols = st.columns(4)
    for i, carte in enumerate(slides):
        with cols[i % 4]:
            st.markdown(f"""
                <div style="
                    border: 3px solid {carte['couleur']};
                    border-radius: 12px;
                    padding: 14px;
                    background-color: #fff;
                    text-align: center;
                    font-weight: bold;
                    color: {carte['couleur']};
                    height: 180px;
                    margin-bottom: 10px;
                    box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
                ">
                    {carte['carte']}<br><small style="color: #666;">{carte['theme']}</small>
                </div>
            """, unsafe_allow_html=True)

# 🧹 Boutons de réinitialisation
st.sidebar.markdown("---")
if st.sidebar.button("🧹 Tout réinitialiser"):
    for key in ['slides', 'index', 'cartes_team1', 'cartes_team2', 'scores', 'last_team_action']:
        if key in st.session_state:
            del st.session_state[key]
    st.rerun()


st.sidebar.markdown("---")
st.sidebar.subheader("🏷️ Noms des équipes")
team1_name = st.sidebar.text_input("Nom de l'équipe 1", st.session_state['team_names']["Team 1"])
team2_name = st.sidebar.text_input("Nom de l'équipe 2", st.session_state['team_names']["Team 2"])
st.session_state['team_names']["Team 1"] = team1_name
st.session_state['team_names']["Team 2"] = team2_name

st.sidebar.markdown("---")
st.sidebar.subheader("📊 Score")
st.sidebar.text(f"{team1_name} : {st.session_state['scores']['Team 1']} cartes")
st.sidebar.text(f"{team2_name} : {st.session_state['scores']['Team 2']} cartes")

if st.sidebar.button("🔄 Réinitialiser les scores"):
    st.session_state['scores'] = {"Team 1": 0, "Team 2": 0}
    st.success("Scores réinitialisés.")

if st.session_state.get("last_team_action"):
    if st.button("↩️ Annuler la dernière attribution"):
        team, last_card = st.session_state['last_team_action']
        if team == "Team 1" and last_card in st.session_state['cartes_team1']:
            st.session_state['cartes_team1'].remove(last_card)
            st.session_state['scores']['Team 1'] -= 1
        elif team == "Team 2" and last_card in st.session_state['cartes_team2']:
            st.session_state['cartes_team2'].remove(last_card)
            st.session_state['scores']['Team 2'] -= 1
        st.session_state['slides'].insert(st.session_state['index'] + 1, last_card)
        st.session_state['last_team_action'] = None
        st.rerun()

if st.session_state['cartes_team1'] or st.session_state['cartes_team2']:
    st.markdown("## 🧑‍🤝‍🧑 Répartition par équipe")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### 🟥 Team 1")
        for carte in st.session_state['cartes_team1']:
            st.markdown(f"- {carte['carte']} ({carte['theme']})")


    with col2:
        st.markdown("### 🟦 Team 2")
        for carte in st.session_state['cartes_team2']:
            st.markdown(f"- {carte['carte']} ({carte['theme']})")

    st.markdown(f"### Score : 🟥 {st.session_state['scores']['Team 1']} – 🟦 {st.session_state['scores']['Team 2']}")

if st.sidebar.button("🔁 Remélanger les cartes gagnées"):
    # Récupérer les cartes gagnées des deux équipes
    cartes_gagnees = st.session_state['cartes_team1'] + st.session_state['cartes_team2']
    
    if cartes_gagnees:
        random.shuffle(cartes_gagnees)
        st.session_state['slides'] = cartes_gagnees
        st.session_state['index'] = -1
        st.success(f"{len(cartes_gagnees)} carte(s) remélangée(s) à partir des équipes.")
        st.rerun()
    else:
        st.warning("Aucune carte gagnée à remélanger.")

