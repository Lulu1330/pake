export default function EquipesInput({ equipes, setEquipes }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {equipes.map((nom, i) => (
        <input
          key={i}
          value={nom}
          onChange={(e) => {
            const copy = [...equipes];
            copy[i] = e.target.value;
            setEquipes(copy);
          }}
          className="border rounded px-2 py-1"
          placeholder={`Équipe ${i + 1}`}
        />
      ))}
    </div>
  );
}
