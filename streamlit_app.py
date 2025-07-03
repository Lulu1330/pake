import streamlit as st
import random
import json
import os


# Chargement de la base de données
path = os.path.join(os.path.dirname(__file__), "cartes_base.json")
with open(path, "r", encoding="utf-8") as f:
    cartes = json.load(f)

st.set_page_config(layout="wide")

st.sidebar.title("🎛️ Options de tirage")

# Choix des thèmes
themes_disponibles = sorted(set([c["theme"] for c in cartes]))
themes_choisis = st.sidebar.multiselect("Choisissez un ou plusieurs thèmes :", themes_disponibles)

# Choix du nombre de cartes
nb_cartes = st.sidebar.number_input("Nombre de cartes à tirer :", min_value=1, value=10)

# Lancer le tirage
if st.sidebar.button("🎲 Lancer le tirage"):
    cartes_filtrees = [c for c in cartes if c["theme"] in themes_choisis]
    nb = min(nb_cartes, len(cartes_filtrees))
    st.session_state['slides'] = random.sample(cartes_filtrees, nb)
    st.session_state['index'] = -1  # Cache la première carte
    st.session_state['mise_de_cote'] = []

# Remélanger l'ordre du tirage
if st.sidebar.button("🔁 Remélanger"):
    if 'slides' in st.session_state:
        random.shuffle(st.session_state['slides'])
        st.session_state['index'] = 0
        st.rerun()

# Affichage slide
index = st.session_state.get('index', -1)
slides = st.session_state.get("slides", [])
# Afficher bouton "Commencer" si index == -1
if index == -1 and slides:
    st.markdown("## 👀 Prêt ? Cliquez pour afficher la première carte")
    if st.button("▶️ Commencer la présentation"):
        st.session_state['index'] = 0
        st.rerun()


if 0 <= index < len(slides):
    carte = slides[index]

    # Affichage de la carte principale
    st.markdown(
        f"""
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 350px;
        ">
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
                {carte['nom']}
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
        </div>
        """,
        unsafe_allow_html=True
    )

    # Navigation + actions
    total = len(slides)
    col1, col2, col3 = st.columns([1, 2, 1])

    with col1:
        if st.button("◀️ Précédente") and index > 0:
            st.session_state['index'] -= 1
            st.rerun()

    with col3:
        if st.button("▶️ Suivante") and index < total - 1:
            st.session_state['index'] += 1
            st.rerun()

    with col2:
        if st.button("🗃️ Mettre cette carte de côté"):
            st.session_state['mise_de_cote'].append(carte)
            del st.session_state['slides'][index]
            if st.session_state['index'] >= len(st.session_state['slides']):
                st.session_state['index'] = max(0, len(st.session_state['slides']) - 1)
            st.rerun()

        if st.button("🔄 Remplacer cette carte"):
            tirage = st.session_state['slides']
            carte_actuelle = tirage[index]
            cartes_disponibles = [
                c for c in cartes
                if c not in tirage
                and c not in st.session_state.get("mise_de_cote", [])
                and c['theme'] == carte_actuelle['theme']
            ]
            if cartes_disponibles:
                nouvelle_carte = random.choice(cartes_disponibles)
                st.session_state['slides'][index] = nouvelle_carte
                st.rerun()
            else:
                st.warning("Aucune autre carte disponible pour remplacement.")

else:
    if 'slides' in st.session_state and st.session_state['slides']:
        st.markdown("### 👋 Cliquez sur ▶️ Suivante pour commencer la présentation.")
    else:
        st.markdown("### 🎴 Lancez un tirage dans le menu de gauche.")

# Affichage des cartes mises de côté
if st.session_state.get("mise_de_cote"):
    st.markdown("## 🏆 Cartes mises de côté")
    cols = st.columns(4)
    for i, carte in enumerate(st.session_state["mise_de_cote"]):
        with cols[i % 4]:
            st.markdown(
                f"""
                <div style="
                    border: 2px dashed {carte['couleur']};
                    border-radius: 12px;
                    padding: 12px;
                    background-color: #f8f8f8;
                    font-size: 14px;
                    text-align: center;
                    color: {carte['couleur']};
                    height: 150px;
                ">
                    {carte['nom']}<br><small>{carte['theme']}</small>
                </div>
                """,
                unsafe_allow_html=True
            )

# Initialiser le toggle une fois
if 'show_all_cards' not in st.session_state:
    st.session_state['show_all_cards'] = False

# Bouton toggle
toggle_text = "🔽 Voir toutes les cartes du tirage" if not st.session_state['show_all_cards'] else "🔼 Masquer les cartes"
if st.button(toggle_text):
    st.session_state['show_all_cards'] = not st.session_state['show_all_cards']

# Affichage de toutes les cartes du tirage
if st.session_state['show_all_cards']:
    st.markdown("## 🃏 Cartes du tirage")
    slides = st.session_state.get("slides", [])
    cols = st.columns(4)
    for i, carte in enumerate(slides):
        with cols[i % 4]:
            st.markdown(
                f"""
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
                    {carte['nom']}<br>
                    <small style="color: #666;">{carte['theme']}</small>
                </div>
                """,
                unsafe_allow_html=True
            )
