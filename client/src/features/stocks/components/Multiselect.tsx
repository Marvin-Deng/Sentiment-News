import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Input,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

interface MultiSelectDropdownProps {
  selectName: string;
  originalOptions: string[];
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const MultiSelectDropdown = ({
  selectName,
  originalOptions,
  selectedOptions,
  setSelectedOptions,
}: MultiSelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = originalOptions.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  const toggleOption = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value],
    );
  };

  return (
    <Box position="relative" w="25%">
      <Button
        onClick={() => setOpen((prev) => !prev)}
        variant="outline"
        colorPalette="gray"
        w="full"
        borderRadius="full"
        justifyContent="space-between"
        size="sm"
      >
        <Text truncate>{selectName}</Text>
        <MdKeyboardDoubleArrowDown />
      </Button>
      {open && (
        <Card.Root position="absolute" mt={2} w="full" zIndex={50} p={3}>
          <Input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search"
            size="sm"
            mb={2}
          />
          <SimpleGrid columns={2} gap={2} maxH="240px" overflowY="auto">
            {filtered.map((name) => (
              <Checkbox.Root
                key={name}
                checked={selectedOptions.includes(name)}
                onCheckedChange={() => toggleOption(name)}
                cursor="pointer"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control cursor="pointer" />
                <Checkbox.Label cursor="pointer">
                  <Text fontSize="sm">{name}</Text>
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
