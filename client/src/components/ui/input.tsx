import { Input as ChakraInput } from "@chakra-ui/react";
import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <ChakraInput ref={ref} className={className} {...(props as object)} />;
  }
);

export default Input;
