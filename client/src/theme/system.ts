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
      outlineCircular: {
        bg: "transparent",
        color: "fg",
        border: "1px solid",
        borderColor: "border.control",
        borderRadius: "md",
        transition: "background-color 0.3s ease, color 0.3s ease",
        _hover: { bg: "fg", color: "bg" },
      },
    },
  },
});

const datePickerRecipe = defineSlotRecipe({
  slots: [
    "trigger",
    "tableCellTrigger",
    "prevTrigger",
    "nextTrigger",
    "viewTrigger",
    "clearTrigger",
  ],
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
  globalCss: {
    "svg:focus, svg:focus-visible, svg:focus-within": { outline: "none !important" },
    ".recharts-wrapper:focus, .recharts-wrapper *:focus, .recharts-surface:focus, .recharts-surface *:focus":
      { outline: "none !important" },
    "table:focus, th:focus, td:focus, tr:focus": { outline: "none" },
  },
  theme: {
    textStyles,
    semanticTokens: {
      colors: {
        border: {
          control: {
            value: {
              _light: "{colors.gray.400}",
              _dark: "{colors.whiteAlpha.400}",
            },
          },
        },
        positive: {
          DEFAULT: {
            value: {
              _light: "{colors.green.600}",
              _dark: "{colors.green.600}",
            },
          },
          emphasized: {
            value: {
              _light: "{colors.green.700}",
              _dark: "{colors.green.700}",
            },
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
