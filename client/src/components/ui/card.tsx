import { Card as ChakraCard } from "@chakra-ui/react";
import React from "react";

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <ChakraCard.Root className={className}>{children}</ChakraCard.Root>
);

export const CardHeader: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <ChakraCard.Header className={className} pb={1}>{children}</ChakraCard.Header>
);

export const CardTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <ChakraCard.Title className={className}>{children}</ChakraCard.Title>
);

export const CardContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <ChakraCard.Body className={className}>{children}</ChakraCard.Body>
);

export default Card;
