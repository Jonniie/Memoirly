import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export default function SearchBar({ onSearch, className }) {
  const [query, setQuery] = useState("");

  // Debounce search to avoid too many updates
  const debouncedSearch = useCallback(
    (value) => {
      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, 300); // 300ms delay

      return () => clearTimeout(timeoutId);
    },
    [onSearch]
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search by caption, tags, or emotion..."
          className="w-full px-4 py-2 pl-10 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
      </div>
    </div>
  );
}
