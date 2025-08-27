export const colors = {
  light: {
    // Background colors
    background: {
      primary: "#fafaf8",
      secondary: "#ffffff",
      tertiary: "#f6f6f7",
    },

    // Text colors
    text: {
      primary: "#2a2b2a",
      secondary: "#717680",
      muted: "#717680",
    },

    // Brand colors
    brand: {
      primary: "#00b48d", // Main green
      primaryHover: "#00a080", // Darker green for hover
      secondary: "#69a3e9", // Blue accent
    },

    // Border colors
    border: {
      primary: "#e4e2dd",
      secondary: "#c4c4c4",
    },

    // State colors
    state: {
      active: "#00b48d",
      inactive: "#c4c4c4",
      error: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
    },
  },

  // Dark mode colors will be added later
  dark: {
    // Placeholder for future dark mode implementation
  },
} as const

// Type for color access
export type ColorTheme = typeof colors.light