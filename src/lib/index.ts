// Main exports for the Cliniva design system
export { colors, type ColorTheme } from './colors';

// Design System exports
export {
  designSystem,
  getThemeColor,
  getTypographyStyle,
  getColor,
  getSpacing,
  getFontSize,
  getBreakpoint,
  generateThemeCSS,
  tailwindConfig,
  type Theme,
  type ThemeColors,
  type ThemeContextType,
  type ColorScale,
  type ColorName,
  type FontSize,
  type FontWeight,
  type Spacing,
  type BorderRadius,
  type BoxShadow,
  type ZIndex,
  type Breakpoint,
  type TypographyCategory,
  type HeadingSize,
  type TitleSize,
  type ButtonSize,
  type ParagraphSize,
} from './design-system';

// Re-export design system as default for convenience
export { default } from './design-system';
