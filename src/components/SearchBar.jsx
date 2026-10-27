import React, { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [search, setSearch] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    if (search.trim()) {
      console.log("Buscar servicio:", search.trim());
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <form className="home-search" onSubmit={handleSearch}>
      <Search
        className="search-icon"
        size={21}
        aria-hidden="true"
      />

      <input
        type="search"
        placeholder="Buscar citas, recetas, servicios..."
        aria-label="Buscar servicios de EsSalud"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {search && (
        <button
          className="search-clear"
          type="button"
          onClick={clearSearch}
          aria-label="Limpiar búsqueda"
        >
          <X size={18} />
        </button>
      )}

      <button
        className="search-submit"
        type="submit"
        aria-label="Buscar"
      >
        Buscar
      </button>
    </form>
  );
}