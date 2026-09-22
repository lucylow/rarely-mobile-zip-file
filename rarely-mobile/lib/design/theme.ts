import type { ThemeColorPalette } from "@/constants/theme";

export type AppTheme = {
  canvas: string;
  ink: string;
  mutedInk: string;
  accent: string;
  surface: string;
  elevatedSurface: string;
  border: string;
  danger: string;
};

export function createAppTheme(colors: ThemeColorPalette): AppTheme {
  return {
    canvas: colors.background,
    ink: colors.foreground,
    mutedInk: colors.muted,
    accent: colors.primary,
    surface: colors.surface,
    elevatedSurface: colors.surface,
    border: colors.border,
    danger: colors.error,
  };
}
