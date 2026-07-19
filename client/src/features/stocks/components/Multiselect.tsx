import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Checkbox,
  Input,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import FilterControlButton from "@/src/components/ui/FilterControlButton";

interface MultiSelectDropdownProps {
  selectName: string;
  originalOptions: string[];
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
  getLabel?: (value: string) => string;
}

const MultiSelectDropdown = ({
  selectName,
  originalOptions,
  selectedOptions,
  setSelectedOptions,
  getLabel = (value) => value,
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = originalOptions.filter((value) =>
    getLabel(value).toLowerCase().includes(filter.toLowerCase()),
  );

  const toggleOption = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value],
    );
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
    <Box
      position="relative"
      w={{ base: "full", md: "auto" }}
      flex={{ md: "1" }}
      minW={{ md: 0 }}
      maxW={{ md: "calc(25% - 0.5625rem)" }}
      ref={containerRef}
    >
      <FilterControlButton
        onClick={() => setOpen((prev) => !prev)}
        w="full"
        justifyContent="space-between"
      >
        <Text truncate>{selectName}</Text>
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
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search"
            size="sm"
            mb={2}
            borderColor="gray.400"
            _dark={{ borderColor: "whiteAlpha.600" }}
          />
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2} maxH="240px" overflowY="auto">
            {filtered.map((value) => (
              <Checkbox.Root
                key={value}
                checked={selectedOptions.includes(value)}
                onCheckedChange={() => toggleOption(value)}
                cursor="pointer"
                py={1}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control cursor="pointer" />
                <Checkbox.Label cursor="pointer">
                  <Text fontSize="sm">{getLabel(value)}</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            ))}
          </SimpleGrid>
        </Card.Root>
      )}
    </Box>
  );
};

export default MultiSelectDropdown;
