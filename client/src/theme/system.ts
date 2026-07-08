import { createSystem, defaultConfig, defineConfig, defineRecipe, defineSlotRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      filterControl: {
        h: "8",
        textStyle: "sm",
        color: "fg",
        borderWidth: "1px",
        borderRadius: "md",
        borderColor: "border.control",
        _hover: { bg: "bg.muted" },
      },
    },
  },
});

const datePickerRecipe = defineSlotRecipe({
  slots: ["trigger", "tableCellTrigger", "prevTrigger", "nextTrigger", "viewTrigger", "clearTrigger"],
  base: {
    trigger: { cursor: "pointer" },
    tableCellTrigger: { cursor: "pointer" },
    prevTrigger: { cursor: "pointer" },
    nextTrigger: { cursor: "pointer" },
    viewTrigger: { cursor: "pointer" },
    clearTrigger: { cursor: "pointer" },
  },
});

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        border: {
          control: {
            value: { _light: "{colors.gray.400}", _dark: "{colors.whiteAlpha.400}" },
          },
        },
        positive: {
          value: { _light: "{colors.green.600}", _dark: "{colors.green.600}" },
        },
        negative: {
          value: { _light: "{colors.red.500}", _dark: "{colors.red.500}" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
    slotRecipes: {
      datePicker: datePickerRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, config);
