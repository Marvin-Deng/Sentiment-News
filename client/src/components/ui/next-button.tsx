import React from "react";
import { Button } from "@chakra-ui/react";

interface NextButtonProps {
  onClick: () => void;
}

const NextButton: React.FC<NextButtonProps> = ({ onClick }) => (
  <Button onClick={onClick} colorPalette="gray" variant="solid">
    Load More
  </Button>
);

export default NextButton;
