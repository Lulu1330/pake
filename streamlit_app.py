import streamlit as st
import random
from utils import charger_cartes, tirer_cartes, remplacer_carte
import sqlite3

#st.set_page_config(layout="wide")

from my_pages import accueil, politique, apropos, mentions

st.set_page_config(page_title="Pake de Cartes", layout="centered")

# État de la page actuelle
if "page" not in st.session_state:
    st.session_state.page = "menu_principal"

# Navigation principale
if st.session_state.page == "menu_principal":
    st.title("Bienvenue sur Pake de Cartes 👋")
    st.markdown("Choisissez une section pour commencer :")

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🃏 Tirer cartes"):
            st.session_state.page = "cartes"
    with col2:
        if st.button("📄 Politique de confidentialité"):
            st.session_state.page = "confidentialite"

    col3, col4 = st.columns(2)
    with col3:
        if st.button("ℹ️ À propos"):
            st.session_state.page = "apropos"
    with col4:
        if st.button("📌 Mentions légales"):
            st.session_state.page = "mentions"

# Pages individuelles
elif st.session_state.page == "confidentialite":
    st.title("Politique de confidentialité")
    st.markdown("""
    Nous respectons votre vie privée...
    """)
    if st.button("Retour"):
        st.session_state.page = "menu_principal"

elif st.session_state.page == "apropos":
    st.title("À propos")
    st.markdown("""
    Ce projet a été créé par passion...
    """)
    if st.button("Retour"):
        st.session_state.page = "menu_principal"

elif st.session_state.page == "mentions":
    st.title("Mentions légales")
    st.markdown("""
    Ce site est édité par Lulu1330...
    """)
    if st.button("Retour"):
        st.session_state.page = "menu_principal"

elif st.session_state.page == "cartes":
    import time

    def reset_tout():
        for key in ['slides', 'index', 'cartes_team1', 'cartes_team2', 'scores', 'last_team_action']:
            st.session_state.pop(key, None)

    def remelanger_cartes():
        cartes = st.session_state['cartes_team1'] + st.session_state['cartes_team2']
        if cartes:
            random.shuffle(cartes)
            st.session_state['slides'] = cartes
            st.session_state['index'] = -1
            st.success("Cartes remélangées.")
            st.rerun()
        else:
            st.warning("Aucune carte à remélanger.")

    st.title("🎴 Tirage de cartes")
    slides = st.session_state.get('slides', [])
    index = st.session_state.get('index', -1)
    if not slides:
        st.markdown("""
            <div style='text-align: center; margin-top: 100px;'>
                <div style='font-size: 64px;'>⬅️</div>
                <p style='font-size: 20px; font-weight: bold;'>Choisissez vos options de tirage dans le menu à gauche</p>
                <p style='color: grey;'>Thèmes, nombre de cartes, noms d’équipes…</p>
            </div>
        """, unsafe_allow_html=True)

    if st.button("⬅️ Retour au menu"):
        st.session_state.page = "menu_principal"

    # Initialisations
    for key, value in {
        'show_sidebar': True,
        'scores': {"Team 1": 0, "Team 2": 0},
        'team_names': {"Team 1": "Team 1", "Team 2": "Team 2"},
        'last_team_action': None,
        'cartes_team1': [],
        'cartes_team2': [],
        'show_all_cards': False
    }.items():
        st.session_state.setdefault(key, value)

    # Sidebar
    col_sidebar_toggle, _ = st.columns([1, 5])

    if st.session_state.show_sidebar:
        st.sidebar.title("🎛️ Options")

        with st.sidebar.expander("🎯 Thèmes"):
            def charger_themes():
                conn = sqlite3.connect("cartes.db")
                cursor = conn.cursor()
                cursor.execute("SELECT DISTINCT theme FROM cartes")
                themes = [row[0] for row in cursor.fetchall()]
                conn.close()
                return sorted(themes)

            themes_disponibles = charger_themes()
            tout_selectionner = st.checkbox("✅ Tout sélectionner", value=False)
            themes_choisis = themes_disponibles if tout_selectionner else [t for t in themes_disponibles if st.checkbox(t, key=t)]

        with st.sidebar.expander("🎲 Tirage"):
            nb_cartes = st.number_input("Nombre de cartes", min_value=1, value=10)
            if st.button("Lancer le tirage"):
                st.session_state['slides'] = tirer_cartes(charger_cartes(), themes_choisis, nb_cartes)
                st.session_state['index'] = -1
                st.session_state['mise_de_cote'] = []
                st.rerun()

        with st.sidebar.expander("🏷️ Équipes"):
            st.session_state['team_names']['Team 1'] = st.text_input("Nom équipe 1", st.session_state['team_names']['Team 1'])
            st.session_state['team_names']['Team 2'] = st.text_input("Nom équipe 2", st.session_state['team_names']['Team 2'])

        with st.sidebar.expander("📊 Score & Actions"):
            st.text(f"{st.session_state['team_names']['Team 1']} : {st.session_state['scores']['Team 1']} cartes")
            st.text(f"{st.session_state['team_names']['Team 2']} : {st.session_state['scores']['Team 2']} cartes")
            if st.button("🔄 Réinitialiser les scores"):
                st.session_state['scores'] = {"Team 1": 0, "Team 2": 0}
            if st.button("🔁 Remélanger les cartes du Tirage"):
                remelanger_cartes()
            if st.button("🧹 Réinitialiser"):
                reset_tout()
                st.rerun()

    # Affichage principal
    st.markdown("""
        <style>
        .card-container { display: flex; justify-content: center; align-items: center; height: 350px; margin-bottom: 1rem; }
        .card {
            width: 240px; height: 300px; border-radius: 16px;
            border: 4px solid var(--card-color, #000);
            background-color: #fff; font-size: calc(20px + 1vw);
            font-weight: bold; color: var(--card-color, #000);
            box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.1);
            display: flex; justify-content: center; align-items: center; text-align: center;
        }
        @media only screen and (max-width: 600px) {
            .card { width: 160px !important; height: 200px !important; font-size: 16px !important; }
        }
        </style>
    """, unsafe_allow_html=True)

    if index == -1 and slides:
        st.markdown("""
            <style>
            .card-container {
                position: relative;
                width: 240px;
                height: 300px;
                margin: 50px auto;
            }
            .card {
                width: 100%;
                height: 100%;
                border-radius: 16px;
                border: 4px solid #333;
                background: linear-gradient(135deg, #333 25%, #666 25%, #666 50%, #333 50%, #333 75%, #666 75%, #666);
                background-size: 40px 40px;
                font-size: calc(20px + 1vw);
                font-weight: bold;
                color: white;
                box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
            </style>

            <div class="card-container">
                <div class="card">🂠</div>
            </div>
        """, unsafe_allow_html=True)

        # ✅ Bouton visible et centré pour commencer
        st.markdown("<div style='text-align: center;'>", unsafe_allow_html=True)
        if st.button("🚀 Commencer le tirage"):
            st.session_state['index'] = 0
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

    
    elif 0 <= index < len(slides):
        st.markdown(f"### Score : 🟥 {st.session_state['scores']['Team 1']} – 🟦 {st.session_state['scores']['Team 2']}")
        carte = slides[index]
        team1, team2 = st.session_state['team_names'].values()

        st.markdown(f"""
        <div class='card-container'>
            <div class='card' style='--card-color: {carte['couleur']}'>
                {carte['carte']}
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown(f"**Carte {index + 1} sur {len(slides)}**")
        st.markdown("---")

        col1, col2, col3 = st.columns(3)
        with col1:
            if st.button("◀️ Préc.", key="prev") and index > 0:
                st.session_state['index'] -= 1
                st.rerun()
        with col2:
            if st.button(f"🏅 {team1}"):
                st.session_state['cartes_team1'].append(carte)
                st.session_state['last_team_action'] = ("Team 1", carte)
                del st.session_state['slides'][index]
                st.session_state['index'] = min(index, len(st.session_state['slides']) - 1)
                st.session_state['scores']['Team 1'] += 1
                st.rerun()
            if st.button(f"🏅 {team2}"):
                st.session_state['cartes_team2'].append(carte)
                st.session_state['last_team_action'] = ("Team 2", carte)
                del st.session_state['slides'][index]
                st.session_state['index'] = min(index, len(st.session_state['slides']) - 1)
                st.session_state['scores']['Team 2'] += 1
                st.rerun()
        with col3:
            if st.button("▶️ Suiv.", key="next") and index < len(slides) - 1:
                st.session_state['index'] += 1
                st.rerun()
            if st.button("🔄 Remplacer cette carte"):
                nouvelle = remplacer_carte(charger_cartes(), slides, index, st.session_state.get("mise_de_cote", []))
                if nouvelle:
                    st.session_state['slides'][index] = nouvelle
                    st.rerun()
                else:
                    st.warning("Aucune autre carte disponible.")

        if st.session_state.get("last_team_action") and st.button("↩️ Annuler attribution"):
            team, last_card = st.session_state['last_team_action']
            if team == "Team 1" and last_card in st.session_state['cartes_team1']:
                st.session_state['cartes_team1'].remove(last_card)
                st.session_state['scores']['Team 1'] -= 1
            elif team == "Team 2" and last_card in st.session_state['cartes_team2']:
                st.session_state['cartes_team2'].remove(last_card)
                st.session_state['scores']['Team 2'] -= 1
            st.session_state['slides'].insert(index + 1, last_card)
            st.session_state['last_team_action'] = None
            st.rerun()

        st.markdown("---")
        if st.session_state['cartes_team1'] or st.session_state['cartes_team2']:
            st.markdown("## 🧑‍🤝‍🧑 Répartition par équipe")
            col1, col2 = st.columns(2)
            with col1:
                st.markdown(f"### 🟥 {team1}")
                for carte in st.session_state['cartes_team1']:
                    st.markdown(f"- {carte['carte']} ({carte['theme']})")
            with col2:
                st.markdown(f"### 🟦 {team2}")
                for carte in st.session_state['cartes_team2']:
                    st.markdown(f"- {carte['carte']} ({carte['theme']})")
