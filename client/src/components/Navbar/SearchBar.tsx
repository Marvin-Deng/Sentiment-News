"use client";
import { useState, useEffect, useRef } from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { useSearch } from "../../providers/SearchProvider";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
  const [searchString, setSearchString] = useState("");
  const { updateSearchQuery } = useSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSearchQuery(searchString);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchString, updateSearchQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateSearchQuery(searchString);
  };

  return (
    <form style={{ position: "relative", width: "100%" }} onSubmit={handleSubmit}>
      <Input
        type="search"
        placeholder="Search"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
        borderRadius="md"
        pr={10}
        borderColor="gray.400"
        _dark={{ borderColor: "whiteAlpha.400" }}
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
