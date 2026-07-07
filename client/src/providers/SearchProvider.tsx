"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextValue {
  searchQuery: string;
  updateSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const useSearch = (): SearchContextValue => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};

const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, updateSearchQuery: setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
