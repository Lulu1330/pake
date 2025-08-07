export default function NumberInputField({ label, value, onChange, min = 0 }) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="border rounded px-3 py-1 ml-2 w-20 text-center"
      />
    </label>
  );
}
