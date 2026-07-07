"use client";
import React, { createContext, useState } from "react";

export interface SearchContextProps {
  searchQuery: string;
  updateSearchQuery: (query: string) => void;
}

export const SearchContext = createContext<SearchContextProps | undefined>(undefined);

const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, updateSearchQuery: setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
