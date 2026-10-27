// Färgpaletter för appen. Byt ACTIVE_PALETTE för att testa ett annat utseende.
const palettes = {
  // Varm biokänsla: mörk bakgrund med popcornorange accent
  bio: {
    bg: "#0e1014",
    card: "#171a21",
    cardAlt: "#20242d",
    border: "#2a2f3a",
    text: "#f3f4f6",
    muted: "#9198a5",
    accent: "#ffb020",
    accentSoft: "rgba(255, 176, 32, 0.14)",
    onAccent: "#1b1300",
    blue: "#6ea8ff",
    green: "#3ddc97",
    danger: "#ff5d5d",
    amber: "#ffb020"
  },
  // Lila neonkänsla
  natt: {
    bg: "#0d0b14",
    card: "#17141f",
    cardAlt: "#211c2c",
    border: "#2e2840",
    text: "#f4f2f8",
    muted: "#9a93ab",
    accent: "#b98cff",
    accentSoft: "rgba(185, 140, 255, 0.16)",
    onAccent: "#160a2b",
    blue: "#6ec3ff",
    green: "#4fe0a8",
    danger: "#ff6b81",
    amber: "#ffc857"
  },
  // Lugn turkos
  hav: {
    bg: "#0b1214",
    card: "#131d20",
    cardAlt: "#1a272b",
    border: "#263539",
    text: "#eef5f6",
    muted: "#8fa3a8",
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.14)",
    onAccent: "#04201c",
    blue: "#7aa7ff",
    green: "#a3e635",
    danger: "#ff6b6b",
    amber: "#fbbf24"
  }
} as const;

const ACTIVE_PALETTE: keyof typeof palettes = "bio";

export const colors = palettes[ACTIVE_PALETTE];

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const statusLabels: Record<string, string> = {
  unwatched: "Unwatched",
  watching: "Watching",
  watched: "Watched"
};

export const statusColors: Record<string, string> = {
  unwatched: colors.muted,
  watching: colors.blue,
  watched: colors.green
};

export const kindLabels: Record<string, string> = {
  movie: "Movie",
  series: "Series"
};

// Bakgrundsfärger för affischer utan bild, väljs utifrån titelns namn
export const posterTints = ["#3b2f5c", "#1f4a5a", "#5a2e3a", "#2f4a2e", "#5a4a24", "#2c3a5e"];
