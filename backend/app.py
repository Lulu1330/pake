from flask import Flask, request, jsonify
from flask_cors import CORS
from logic import tirer_cartes

app = Flask(__name__)
CORS(app)  # Autorise les appels depuis le frontend React

@app.route("/")
def home():
    return "API Pake de Cartes fonctionne !"

@app.route("/tirage", methods=["POST"])
def tirage():
    data = request.get_json()
    themes = data.get("themes", [])
    nb_cartes = data.get("nb_cartes", 10)

    cartes = tirer_cartes(themes, nb_cartes)
    return jsonify(cartes)

if __name__ == "__main__":
    app.run(debug=True)
