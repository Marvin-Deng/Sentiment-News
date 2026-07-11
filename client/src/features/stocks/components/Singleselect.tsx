import React, { useEffect, useRef, useState } from "react";
import { Box, Card, Text } from "@chakra-ui/react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import FilterControlButton from "@/src/components/ui/FilterControlButton";

interface SingleSelectDropdownProps {
  placeholder: string | null;
  originalOptions: Map<number, string>;
  selectedOption: number | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<number | null>>;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  placeholder,
  originalOptions,
  selectedOption,
  setSelectedOption,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOptionSelect = (key: number) => {
    setSelectedOption(selectedOption === key ? null : key);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Box position="relative" w={{ base: "full", md: "auto" }} flex={{ md: "1" }} minW={{ md: 0 }} ref={containerRef}>
      <FilterControlButton
        onClick={() => setOpen(!open)}
        w="full"
        justifyContent="space-between"
      >
        <Text truncate>
          {selectedOption !== null ? originalOptions.get(selectedOption) : placeholder}
        </Text>
        <MdKeyboardDoubleArrowDown />
      </FilterControlButton>
      {open && (
        <Card.Root
          position="absolute"
          mt={2}
          w="full"
          zIndex={50}
          p={3}
          borderWidth="1px"
          borderColor="border.control"
        >
          {Array.from(originalOptions.entries()).map(([key, value]) => (
            <Box
              key={key}
              display="flex"
              alignItems="center"
              gap={3}
              p={2}
              borderRadius="md"
              cursor="pointer"
              onClick={() => handleOptionSelect(key)}
            >
              <Box
                w={4}
                h={4}
                borderRadius="full"
                border="1px solid"
                borderColor={selectedOption === key ? "fg" : "gray.500"}
                _dark={{ borderColor: selectedOption === key ? "fg" : "whiteAlpha.600" }}
                bg={selectedOption === key ? "fg" : "transparent"}
              />
              <Text fontSize="sm">{value}</Text>
            </Box>
          ))}
        </Card.Root>
      )}
    </Box>
  );
};

export default SingleSelectDropdown;
