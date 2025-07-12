import streamlit as st
import random
from utils import charger_cartes, tirer_cartes, remplacer_carte
import sqlite3

st.set_page_config(layout="wide")

# ------ Chargement des thèmes depuis la base ------
def charger_themes():
    conn = sqlite3.connect("cartes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT theme FROM cartes")
    themes = [row[0] for row in cursor.fetchall()]
    conn.close()
    return sorted(themes)

# ------ Initialisation session_state ------
if 'scores' not in st.session_state:
    st.session_state['scores'] = {"Team 1": 0, "Team 2": 0}
if 'team_names' not in st.session_state:
    st.session_state['team_names'] = {"Team 1": "Team 1", "Team 2": "Team 2"}
if 'last_team_action' not in st.session_state:
    st.session_state['last_team_action'] = None
if 'cartes_team1' not in st.session_state:
    st.session_state['cartes_team1'] = []
if 'cartes_team2' not in st.session_state:
    st.session_state['cartes_team2'] = []
if 'show_all_cards' not in st.session_state:
    st.session_state['show_all_cards'] = False

# ------ Chargement des cartes ------
cartes = charger_cartes()
themes_disponibles = charger_themes()

# ------ Sidebar ------
st.sidebar.title("🎛️ Options de tirage")
tout_selectionner = st.sidebar.checkbox("✅ Tout sélectionner", value=False)
themes_choisis = themes_disponibles if tout_selectionner else [t for t in themes_disponibles if st.sidebar.checkbox(t)]
nb_cartes = st.sidebar.number_input("Nombre de cartes à tirer :", min_value=1, value=10)

if st.sidebar.button("🎲 Lancer le tirage"):
    st.session_state['slides'] = tirer_cartes(cartes, themes_choisis, nb_cartes)
    st.session_state['index'] = -1
    st.session_state['mise_de_cote'] = []
    st.rerun()

# ------ Section principale ------
st.markdown("""
<style>
.card {
    border-radius: 16px;
    padding: 24px;
    background: linear-gradient(145deg, #ffffff, #f0f0f0);
    text-align: center;
    font-weight: bold;
    font-size: 24px;
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}
.card:hover {
    transform: scale(1.02);
}

/* 🔽 Ajout de la partie responsive mobile */
@media only screen and (max-width: 600px) {
    .card {
        font-size: 16px !important;
        padding: 12px !important;
        width: 160px !important;
        height: 200px !important;
    }
}
</style>
""", unsafe_allow_html=True)


index = st.session_state.get('index', -1)
slides = st.session_state.get('slides', [])

# Première carte (affiche le dos de la carte)
if index == -1 and slides:
    st.markdown("## 👀 Prêt ? Cliquez pour afficher la première carte")

    # Affichage d'un dos de carte stylisé
    st.markdown("""
        <div style="display: flex; justify-content: center; align-items: center; height: 350px;">
            <div style="
                border: 4px solid #333;
                border-radius: 16px;
                padding: 24px;
                background: linear-gradient(135deg, #333 25%, #666 25%, #666 50%, #333 50%, #333 75%, #666 75%, #666);
                background-size: 40px 40px;
                width: 240px;
                height: 300px;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                font-weight: bold;
                font-size: calc(20px + 1vw);
                color: white;
                box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.2);
            ">
                🂠
            </div>
        </div>
    """, unsafe_allow_html=True)

    if st.button("▶️ Commencer"):
        st.session_state['index'] = 0
        st.rerun()

# ------ Affichage de la carte ------
if 0 <= index < len(slides):
    st.markdown(f"### Score : 🟥 {st.session_state['scores']['Team 1']} – 🟦 {st.session_state['scores']['Team 2']}")

    carte = slides[index]
    st.markdown(f"""
    <div style="display: flex; justify-content: center; align-items: center; height: 350px;">
        <div style="
            width: 240px;
            height: 300px;
            padding: 24px;
            border-radius: 16px;
            border: 4px solid {carte['couleur']};
            background-color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
            font-weight: bold;
            font-size: calc(20px + 1vw);
            color: {carte['couleur']};
        ">
            {carte['carte']}
        </div>
    </div>
""", unsafe_allow_html=True)


    st.markdown(f"**Carte {index + 1} sur {len(slides)}**")

    nav_col1, action_col, nav_col2 = st.columns([1, 2, 1])

    with nav_col1:
        if st.button("◀️ Précédente") and index > 0:
            st.session_state['index'] -= 1
            st.rerun()

    with nav_col2:
        if st.button("▶️ Suivante") and index < len(slides) - 1:
            st.session_state['index'] += 1
            st.rerun()

        team1 = st.session_state['team_names']['Team 1']
        team2 = st.session_state['team_names']['Team 2']
        
    with action_col:
        if st.button(f"🏅 Envoyer à {team1}"):
            st.session_state['cartes_team1'].append(carte)
            st.session_state['last_team_action'] = ("Team 1", carte)
            del st.session_state['slides'][index]
            st.session_state['index'] = min(index, len(st.session_state['slides']) - 1)
            st.session_state['scores']['Team 1'] += 1
            st.rerun()

        if st.button(f"🏅 Envoyer à {team2}"):
            st.session_state['cartes_team2'].append(carte)
            st.session_state['last_team_action'] = ("Team 2", carte)
            del st.session_state['slides'][index]
            st.session_state['index'] = min(index, len(st.session_state['slides']) - 1)
            st.session_state['scores']['Team 2'] += 1
            st.rerun()

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

        if st.button("🔄 Remplacer cette carte"):
            nouvelle = remplacer_carte(cartes, slides, index, st.session_state.get("mise_de_cote", []))
            if nouvelle:
                st.session_state['slides'][index] = nouvelle
                st.rerun()
            else:
                st.warning("Aucune autre carte disponible pour remplacement.")

# ------ Voir toutes les cartes ------
toggle = st.button("🔽 Voir toutes les cartes" if not st.session_state['show_all_cards'] else "🔼 Masquer les cartes")
if toggle:
    st.session_state['show_all_cards'] = not st.session_state['show_all_cards']

if st.session_state['show_all_cards']:
    st.markdown("## 🃏 Cartes restantes")
    cols = st.columns(4)
    for i, carte in enumerate(slides):
        with cols[i % 4]:
            st.markdown(f"""
            <div class='card' style='color: {carte['couleur']}; border: 3px solid {carte['couleur']}; font-size: 16px;'>
                {carte['carte']}<br><span style='font-size: 12px; color: #777;'>({carte['theme']})</span>
            </div>
            """, unsafe_allow_html=True)

# ------ Section scores et équipes ------
if st.session_state['cartes_team1'] or st.session_state['cartes_team2']:
    st.markdown("## 🧑‍🤝‍🧑 Répartition par équipe")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown(f"### 🟥 {st.session_state['team_names']['Team 1']}")
        for carte in st.session_state['cartes_team1']:
            st.markdown(f"- {carte['carte']} ({carte['theme']})")

    with col2:
        st.markdown(f"### 🟦 {st.session_state['team_names']['Team 2']}")
        for carte in st.session_state['cartes_team2']:
            st.markdown(f"- {carte['carte']} ({carte['theme']})")

# ------ Réinitialisation, remélange ------

st.sidebar.markdown("---")
st.sidebar.subheader("🏷️ Noms des équipes")
team1_name = st.sidebar.text_input("Nom de l'équipe 1", st.session_state['team_names']['Team 1'])
team2_name = st.sidebar.text_input("Nom de l'équipe 2", st.session_state['team_names']['Team 2'])
st.session_state['team_names']['Team 1'] = team1_name
st.session_state['team_names']['Team 2'] = team2_name

st.sidebar.subheader("📊 Score")
st.sidebar.text(f"{team1_name} : {st.session_state['scores']['Team 1']} cartes")
st.sidebar.text(f"{team2_name} : {st.session_state['scores']['Team 2']} cartes")

if st.sidebar.button("🔄 Réinitialiser les scores"):
    st.session_state['scores'] = {"Team 1": 0, "Team 2": 0}
    st.success("Scores réinitialisés.")

if st.sidebar.button("🔁 Remélanger le tirage"):
    cartes_gagnees = st.session_state['cartes_team1'] + st.session_state['cartes_team2']
    if cartes_gagnees:
        random.shuffle(cartes_gagnees)
        st.session_state['slides'] = cartes_gagnees
        st.session_state['index'] = -1
        st.success("Cartes remélangées et prêtes pour un nouveau tirage !")
        st.rerun()
    else:
        st.warning("Aucune carte gagnée à remélanger.")

if st.sidebar.button("🧹 Tout réinitialiser"):
    for key in ['slides', 'index', 'cartes_team1', 'cartes_team2', 'scores', 'last_team_action']:
        if key in st.session_state:
            del st.session_state[key]
    st.rerun()
