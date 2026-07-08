import { Button, ButtonProps } from "@chakra-ui/react";

// "filterControl" is a custom variant added to the button recipe in src/theme/system.ts.
// Chakra's generated ButtonProps type isn't aware of it, so it's cast here.
const FILTER_CONTROL_VARIANT = "filterControl" as ButtonProps["variant"];

const FilterControlButton = (props: ButtonProps) => (
  <Button variant={FILTER_CONTROL_VARIANT} {...props} />
);

export default FilterControlButton;
