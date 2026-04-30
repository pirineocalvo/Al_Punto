import { theme } from "ant-design-vue";

export const themeTokens = {
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
        colorItemBg: "transparent",
        // Antes: #f06846 (muy brillante) -> Ahora: Un tono derivado de tu Header
        colorSubItemBg: "#463833",
        colorItemBgHover: "rgba(217, 119, 66, 0.1)",
        colorItemBgSelected: "rgba(217, 119, 66, 0.2)",

        // Texto
        colorItemText: "#E8C9A0",
        colorItemTextHover: "#D97742",
        colorItemTextSelected: "#D97742",

        colorPopupBg: "#3A2E2A",
        colorBgElevated: "#3A2E2A",
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
        colorText: "#C8B49A",
        colorTextHeading: "#D97742",
        colorIcon: "#C8B49A",
        colorIconHover: "#D97742",
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
        colorBgHeader: "#5c443c",
        colorBgBody: "#FFF5EC",
        colorBgSider: "#3A2E2A",
      },
      // ── Mensaje normal y de confirmación ───────────────────────────────────────────────────────────────
      Popconfirm: {
        colorBgElevated: "#ffffff",
      },
      Popover: {
        colorBgElevated: "#fcf4ee",
      },
      Message: {
        colorBgElevated: "#FFFFFF",
      },
    },
  }
};

export const getAntdTheme = (mode) => {
  return themeTokens[mode] || themeTokens.light;
};