import { Skeleton as ChakraSkeleton } from "@chakra-ui/react";
import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <ChakraSkeleton className={className} />
);

export default Skeleton;
