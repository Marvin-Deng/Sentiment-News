import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Card, Text } from "@chakra-ui/react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

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
    <Box position="relative" w="25%" ref={containerRef}>
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        colorPalette="gray"
        w="full"
        borderRadius="md"
        justifyContent="space-between"
        size="sm"
        borderColor="gray.400"
        _dark={{ borderColor: "whiteAlpha.400" }}
      >
        <Text truncate>
          {selectedOption !== null ? originalOptions.get(selectedOption) : placeholder}
        </Text>
        <MdKeyboardDoubleArrowDown />
      </Button>
      {open && (
        <Card.Root
          position="absolute"
          mt={2}
          w="full"
          zIndex={50}
          p={3}
          borderWidth="1px"
          borderColor="gray.400"
          _dark={{ borderColor: "whiteAlpha.400" }}
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
              _hover={{ bg: "gray.100" }}
              onClick={() => handleOptionSelect(key)}
            >
              <Box
                w={4}
                h={4}
                borderRadius="full"
                border="1px solid"
                borderColor={selectedOption === key ? "gray.800" : "gray.300"}
                bg={selectedOption === key ? "gray.800" : "transparent"}
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
