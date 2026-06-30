"use client";
import { useState, useContext } from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
import { SearchContext } from "../../providers/SearchProvider";

const SearchBar = () => {
  const [searchString, setSearchString] = useState<string>("");
  const ctx = useContext(SearchContext);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ctx?.updateSearchQuery(searchString);
  };

  return (
    <form style={{ position: "relative", width: "100%", maxWidth: "28rem" }} onSubmit={handleSubmit}>
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
