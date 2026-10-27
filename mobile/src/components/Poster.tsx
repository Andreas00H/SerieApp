import { Image, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { colors, posterTints } from "../constants/theme";

type Props = {
  name: string;
  imageUrl?: string | null;
  width: number;
  style?: StyleProp<ViewStyle>;
};

function tintFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return posterTints[Math.abs(hash) % posterTints.length];
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Affisch i 2:3 format. Utan bild visas initialer på en färg som hör till titeln.
export default function Poster({ name, imageUrl, width, style }: Props) {
  const height = Math.round(width * 1.5);
  const radius = Math.max(6, Math.round(width / 9));
  const box = { width, height, borderRadius: radius };

  if (imageUrl) {
    return (
      <View style={[styles.frame, box, style]}>
        <Image source={{ uri: imageUrl }} style={[box]} accessibilityIgnoresInvertColors />
      </View>
    );
  }

  return (
    <View style={[styles.frame, styles.empty, box, { backgroundColor: tintFor(name) }, style]}>
      <Text style={[styles.initials, { fontSize: Math.round(width / 3) }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    backgroundColor: colors.cardAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)"
  },
  empty: {
    alignItems: "center",
    justifyContent: "center"
  },
  initials: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "800",
    letterSpacing: 1
  }
});
