import React, { ChangeEvent } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Input,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

interface MultiSelectDropdownProps {
  selectName: string;
  originalOptions: string[];
  selectedOptions: string[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
  handleSubmit: () => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  selectName,
  originalOptions,
  selectedOptions,
  setSelectedOptions,
  handleSubmit,
}) => {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const handleToggleDropdown = () => setOpen(!open);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleCheckboxChange = (value: string) => {
    if (selectedOptions.includes(value)) {
      setSelectedOptions((prev) => prev.filter((o) => o !== value));
    } else {
      setSelectedOptions((prev) => [...prev, value]);
    }
  };

  const handleSubmitClick = () => {
    handleSubmit();
    setOpen(false);
  };

  const filtered = originalOptions.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box position="relative" w="25%">
      <Button
        onClick={handleToggleDropdown}
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
            onChange={handleFilterChange}
            placeholder="Search"
            size="sm"
            mb={2}
          />
          <SimpleGrid columns={2} gap={2} maxH="240px" overflowY="auto">
            {filtered.map((name) => (
              <Checkbox.Root
                key={name}
                checked={selectedOptions.includes(name)}
                onCheckedChange={() => handleCheckboxChange(name)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>
                  <Text fontSize="sm">{name}</Text>
                </Checkbox.Label>
              </Checkbox.Root>
            ))}
          </SimpleGrid>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button onClick={handleSubmitClick} colorPalette="gray" size="sm">
              Apply
            </Button>
          </Box>
        </Card.Root>
      )}
    </Box>
  );
};

export default MultiSelectDropdown;
