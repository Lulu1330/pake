import streamlit as st
import sqlite3

DB_PATH = "cartes.db"

def connecter():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    return conn, cursor

def ajouter_cartes(lignes):
    cartes = []
    for ligne in lignes:
        parts = [p.strip() for p in ligne.split(";")]
        if len(parts) == 3:
            cartes.append(tuple(parts))
    if cartes:
        conn, cursor = connecter()
        cursor.executemany("INSERT INTO cartes (carte, theme, couleur) VALUES (?, ?, ?)", cartes)
        conn.commit()
        conn.close()
        st.success(f"{len(cartes)} carte(s) ajoutée(s) avec succès.")
    else:
        st.warning("Aucune ligne valide détectée.")

def supprimer_par_ids(ids):
    conn, cursor = connecter()
    for id_ in ids:
        cursor.execute("DELETE FROM cartes WHERE id = ?", (id_,))
    conn.commit()
    conn.close()
    st.success(f"{len(ids)} carte(s) supprimée(s) (si elles existaient).")

def afficher_cartes():
    conn, cursor = connecter()
    cursor.execute("SELECT * FROM cartes")
    rows = cursor.fetchall()
    conn.close()
    return rows

# --- Interface Streamlit ---

st.title("🃏 Gestion des Cartes")

st.subheader("➕ Ajouter plusieurs cartes")
with st.form("ajout_cartes"):
    lignes_input = st.text_area("Entre une ou plusieurs lignes au format : carte;thème;couleur", height=150)
    submitted = st.form_submit_button("Ajouter")
    if submitted and lignes_input:
        lignes = lignes_input.strip().split("\n")
        ajouter_cartes(lignes)

st.subheader("🗑️ Supprimer des cartes")
with st.form("suppr_cartes"):
    ids_input = st.text_input("Entrez les ID à supprimer (séparés par des virgules)")
    submit_suppr = st.form_submit_button("Supprimer")
    if submit_suppr:
        try:
            ids = [int(i.strip()) for i in ids_input.split(",") if i.strip()]
            supprimer_par_ids(ids)
        except ValueError:
            st.error("IDs invalides. Utilise uniquement des nombres séparés par des virgules.")

st.subheader("📋 Liste des cartes")
cartes = afficher_cartes()
if cartes:
    st.dataframe(cartes, use_container_width=True)
else:
    st.info("Aucune carte dans la base.")
