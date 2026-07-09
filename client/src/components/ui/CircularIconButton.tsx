import { forwardRef } from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

const OUTLINE_CIRCULAR_VARIANT = "outlineCircular" as IconButtonProps["variant"];

const CircularIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function CircularIconButton(props, ref) {
    return <IconButton ref={ref} variant={OUTLINE_CIRCULAR_VARIANT} {...props} />;
  },
);

export default CircularIconButton;
