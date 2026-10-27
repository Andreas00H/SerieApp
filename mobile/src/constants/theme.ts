export const colors = {
  bg: "#14181c",
  card: "#1f252d",
  cardAlt: "#242b34",
  border: "#2c3440",
  text: "#e5e9ef",
  muted: "#8b98a5",
  accent: "#00e054",
  accentDark: "#0ea344",
  blue: "#40bcf4",
  danger: "#ff5646",
  amber: "#f5c518"
} as const;

export const statusLabels: Record<string, string> = {
  unwatched: "Ej sedd",
  watching: "Tittar",
  watched: "Sedd"
};

export const statusColors: Record<string, string> = {
  unwatched: colors.muted,
  watching: colors.blue,
  watched: colors.accent
};

export const kindLabels: Record<string, string> = {
  movie: "Film",
  series: "Serie"
};
