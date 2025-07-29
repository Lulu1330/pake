from flask import Flask, request, jsonify
from flask_cors import CORS
from cartes import charger_cartes, tirer_cartes

app = Flask(__name__)
CORS(app)  # Autorise les appels depuis le frontend React

@app.route("/")
def home():
    return "API Pake de Cartes fonctionne !"

@app.route("/tirage", methods=["POST"])
def tirage():
    try:
        data = request.get_json()
        themes = data.get("themes", [])
        nb_cartes = data.get("nb_cartes", 5)

        toutes_les_cartes = charger_cartes()
        cartes_tirees = tirer_cartes(toutes_les_cartes, themes, nb_cartes)

        return jsonify(cartes_tirees)
    except Exception as e:
        print(f"Erreur dans /tirage : {e}")
        return jsonify({"error": "Erreur serveur"}), 500

if __name__ == "__main__":
    app.run(debug=True)
