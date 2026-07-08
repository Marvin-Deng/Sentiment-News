import { Button, ButtonProps } from "@chakra-ui/react";

const FilterControlButton = (props: ButtonProps) => (
  <Button
    size="sm"
    h="8"
    borderWidth="1px"
    borderRadius="md"
    borderColor="gray.400"
    _dark={{ borderColor: "whiteAlpha.400" }}
    {...props}
  />
);

export default FilterControlButton;
