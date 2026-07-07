import { Button, type ButtonProps } from "@chakra-ui/react";

const LoadMoreButton = (props: ButtonProps) => (
  <Button
    variant="ghost"
    bg="transparent"
    color="fg"
    border="1px solid"
    borderColor="fg"
    transition="background-color 0.3s ease, color 0.3s ease"
    _hover={{ bg: "fg", color: "bg" }}
    {...props}
  >
    Load More
  </Button>
);

export default LoadMoreButton;
