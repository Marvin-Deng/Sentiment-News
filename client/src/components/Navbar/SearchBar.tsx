"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { SearchContext } from "../../providers/SearchProvider";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
  const [searchString, setSearchString] = useState<string>("");
  const ctx = useContext(SearchContext);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      ctx?.updateSearchQuery(searchString);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    ctx?.updateSearchQuery(searchString);
  };

  return (
    <form style={{ position: "relative", width: "100%" }} onSubmit={handleSubmit}>
      <Input
        type="search"
        placeholder="Search"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        borderRadius="full"
        pr={10}
      />
      <IconButton
        type="submit"
        aria-label="Search"
        variant="ghost"
        size="sm"
        position="absolute"
        right={1}
        top="50%"
        transform="translateY(-50%)"
      >
        <FaSearch />
      </IconButton>
    </form>
  );
};

export default SearchBar;
