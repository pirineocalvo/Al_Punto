import { theme } from "ant-design-vue";

/**
 * Ant Design Theme Configuration
 * This file contains all the design tokens used by Ant Design components.
 * You can modify these variables to change the look and feel of your application.
 */

export const themeTokens = {
  // Common tokens for both light and dark themes
  common: {
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  
  // Dark Theme Tokens
  dark: {
    token: {
      colorPrimary: "#f4a25a", // Warm orange
      colorSuccess: "#3A9E6F",
      colorWarning: "#E8A020",
      colorError: "#D94F3D",
      colorInfo: "#15616D",
      colorBgBase: "#121212", // Very dark grey/black
      colorTextBase: "#F5F5F5", // Light grey
      colorBorder: "#F0C99A",
      borderRadius: 8,
    },
    algorithm: theme.darkAlgorithm,
    components: {
      Menu: {
        itemHoverBg: "rgba(244, 163, 14, 0.1)",
        itemSelectedBg: "rgba(244, 163, 14, 0.15)",
      },
      Button: {
        borderRadius: 8,
      },
      Card: {
        colorBgContainer: "rgba(255, 250, 244, 0.1)",
      }
    },
  },
  
  // Light Theme Tokens
  light: {
    token: {
      colorPrimary: "#D97742", // Earthy orange
      colorSuccess: "#3A9E6F",
      colorWarning: "#E8A020",
      colorError: "#D94F3D",
      colorInfo: "#15616D",
      colorBgBase: "#FFEDDC", // Creamy white
      colorTextBase: "#3A2E2A", // Dark brown/grey
      colorBorder: "#F0C99A",
      borderRadius: 8,
    },
    algorithm: theme.defaultAlgorithm,
    components: {
      Menu: {
        itemHoverBg: "rgba(217, 119, 66, 0.1)",
        itemSelectedBg: "rgba(217, 119, 66, 0.15)",
      },
      Button: {
        borderRadius: 8,
      },
      Card: {
        colorBgContainer: "#F7D6BF",
      }
    },
  },
};

export const getAntdTheme = (mode) => {
  return themeTokens[mode] || themeTokens.dark;
};
