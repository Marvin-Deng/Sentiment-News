"use client";
import { useState, useEffect, useContext } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

import NavLink from "@/src/components/Navbar/NavLink";
import SearchBar from "@/src/components/Navbar/SearchBar";
import StockHeader from "@/src/components/Navbar/StockHeader";
import ThemeToggle from "@/src/components/Navbar/ThemeToggle";
import LightLogo from "../../app/assets/light_logo.png";
import DarkLogo from "../../app/assets/dark_logo.png";

import { SearchContext, SearchContextProps } from "@/src/providers/SearchProvider";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNavLink, setSelectedNavLink] = useState("News");
  const [results, setResults] = useState("");
  const { updateSearchQuery } = useContext(SearchContext) as SearchContextProps;
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    updateSearchQuery(results);
  }, [results, selectedNavLink]);

  return (
    <>
      <StockHeader />
      <nav className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 mt-5">
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          {theme == "light" ? (
            <Image src={LightLogo} className="h-10 w-10 sm:h-12 sm:w-12 mb-3" alt="Logo" />
          ) : (
            <Image src={DarkLogo} className="h-10 w-10 sm:h-12 sm:w-12 mb-3" alt="Logo" />
          )}
          <span className="self-center text-2xl md:text-3xl sm:text-2xl font-semibold whitespace-nowrap">
            Sentiment News
          </span>
        </div>

        <div className="flex md:order-2">
          <div className="mt-1 mr-3">
            <ThemeToggle />
          </div>
          <div className="relative hidden md:block">
            <SearchBar setResults={setResults} />
          </div>
          <button
            data-collapse-toggle="navbar-search"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-lg rounded-lg md:hidden"
            aria-controls="navbar-search"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? "block" : "hidden"
          }`}
          id="navbar-search"
        >
          <div className="relative mt-3 md:hidden">
            <SearchBar setResults={setResults} />
          </div>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
            <NavLink name={"News"} href={"/"} setSelectedNavLink={setSelectedNavLink} />
            <NavLink name={"Stocks"} href={"/stocks"} setSelectedNavLink={setSelectedNavLink} />
            <NavLink name={"About"} href={"#"} setSelectedNavLink={setSelectedNavLink} />
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
