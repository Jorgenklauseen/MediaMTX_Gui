
interface SearchBarProps{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon"></span>
      <input
        className="search-bar__input"
        type="text"
        placeholder={placeholder ?? "Søk..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="search-bar__clear" onClick={() => onChange("")}>
          ✕
        </button>
      )}
    </div>
  );
}