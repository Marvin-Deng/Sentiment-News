import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
  defineTextStyles,
} from "@chakra-ui/react";

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

const textStyles = defineTextStyles({
  sectionTitle: {
    value: {
      fontSize: "lg",
      fontWeight: "semibold",
    },
  },
  caption: {
    value: {
      fontSize: "sm",
      color: "fg.muted",
    },
  },
  tooltipLabel: {
    value: {
      fontWeight: "semibold",
    },
  },
});

export const CHART_AXIS_FONT_SIZE = 13;

const config = defineConfig({
  theme: {
    textStyles,
    semanticTokens: {
      colors: {
        border: {
          control: {
            value: { _light: "{colors.gray.400}", _dark: "{colors.whiteAlpha.400}" },
          },
        },
        positive: {
          DEFAULT: {
            value: { _light: "{colors.green.600}", _dark: "{colors.green.600}" },
          },
          emphasized: {
            value: { _light: "{colors.green.700}", _dark: "{colors.green.700}" },
          },
        },
        negative: {
          DEFAULT: {
            value: { _light: "{colors.red.500}", _dark: "{colors.red.500}" },
          },
          emphasized: {
            value: { _light: "{colors.red.600}", _dark: "{colors.red.600}" },
          },
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
