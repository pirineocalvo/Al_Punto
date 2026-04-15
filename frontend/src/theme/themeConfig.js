import { theme } from "ant-design-vue";

export const themeTokens = {

  // ─── MODO CLARO ──────────────────────────────────────────────────────────────
  light: {
    algorithm: theme.defaultAlgorithm,

    token: {
      // Colores base
      colorPrimary: "#D97742",  
      colorSuccess: "#3A9E6F",
      colorWarning: "#E8A020",
      colorError: "#D94F3D",
      colorInfo: "#15616D",

      // Fondo
      colorBgBase: "#FFF5EC",

      // Texto
      colorTextBase: "#3A2E2A",

      // Borde
      colorBorder: "#E8C9A0",
      colorBorderSecondary: "#F0DCC0",

      // Links
      colorLink: "#B85F34",
      colorLinkHover: "#D97742",
      colorLinkActive: "#97522D",

      // Tipografía
      fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
      fontSize: 15,

      // Radio de borde uniforme
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,

      // Sombra
      boxShadow: "0 2px 12px rgba(100, 60, 20, 0.10)",
      boxShadowSecondary: "0 4px 20px rgba(100, 60, 20, 0.14)",
    },

    components: {
      // ── Button ──────────────────────────────────────────────────────────────
      Button: {
        borderRadius: 8,
        controlHeight: 40,
        paddingContentHorizontal: 18,
      },

      // ── Card ────────────────────────────────────────────────────────────────
      Card: {
        colorBgContainer: "#FFFFFF",
        borderRadiusLG: 12,
        boxShadow: "0 2px 12px rgba(100, 60, 20, 0.10)",
      },

      // ── Menu (el horizontal del header) ─────────────────────────────────────
      Menu: {
        itemHoverBg: "rgba(217, 119, 66, 0.10)",
        itemSelectedBg: "rgba(217, 119, 66, 0.15)",
        itemSelectedColor: "#D97742",
        itemBorderRadius: 6,
      },

      // ── Input / Select / Form ────────────────────────────────────────────────
      Input: {
        colorBgContainer: "#FFFFFF",
        colorBorder: "#E8C9A0",
        hoverBorderColor: "#D97742",
        activeBorderColor: "#bd6535",
        activeShadow: "0 0 0 3px rgba(217, 119, 66, 0.15)",
      },

      Select: {
        colorBgContainer: "#FFFFFF",
        colorBorder: "#E8C9A0",
        optionSelectedBg: "rgba(217, 119, 66, 0.15)",
        optionActiveBg: "rgba(217, 119, 66, 0.08)",
      },

      // ── Calendar ─────────────────────────────────────────────────────────────
      Calendar: {
        colorBgContainer: "#FFFFFF",
      },

      // ── Typography ───────────────────────────────────────────────────────────
      Typography: {
        colorLink: "#B85F34",
        colorLinkHover: "#D97742",
      },

      // ── Drawer (menú móvil) ──────────────────────────────────────────────────
      Drawer: {
        colorBgElevated: "#3A2E2A",
      },

      // ── Table ─────────────────────────────────────
      Table: {
        colorBgContainer: "#FFFFFF",
        headerBg: "#F5E6D6",
        rowHoverBg: "rgba(209, 116, 65, 0.06)",
        borderColor: "#E8C9A0",
      },

      // ── Layout ───────────────────────────────────────────────────────────────
      Layout: {
        headerBg: "#3A2E2A",
        bodyBg: "#FFF5EC",
        footerBg: "#3A2E2A",
      },
    },
  },

  // ─── MODO OSCURO ─────────────────────────────────────────────────────────────
  dark: {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: "#f4a25a",
      colorSuccess: "#3A9E6F",
      colorWarning: "#E8A020",
      colorError: "#D94F3D",
      colorInfo: "#15616D",
      colorBgBase: "#121212",
      colorTextBase: "#F5F5F5",
      colorBorder: "#F0C99A",
      borderRadius: 8,
    },
    components: {
      Menu: {
        itemHoverBg: "rgba(244, 163, 14, 0.1)",
        itemSelectedBg: "rgba(244, 163, 14, 0.15)",
      },
      Button: { borderRadius: 8 },
      Card: { colorBgContainer: "rgba(255, 250, 244, 0.08)" },
    },
  },
};

export const getAntdTheme = (mode) => {
  return themeTokens[mode] || themeTokens.light;
};