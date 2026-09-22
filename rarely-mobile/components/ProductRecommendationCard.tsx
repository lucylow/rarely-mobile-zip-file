import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Product } from "../data/catalog";

export function ProductRecommendationCard({
  product,
  score,
  reasons,
  saved,
  onSave,
  onDismiss,
}: {
  product: Product;
  score: number;
  reasons: string[];
  saved: boolean;
  onSave: () => void;
  onDismiss: () => void;
}) {
  const source = product.imageUrl.startsWith("mock://") ? require("../assets/mock/serpapi.png") : { uri: product.imageUrl };
  return <View style={styles.card}>
    <Image source={source} accessibilityLabel={`${product.title} mock product image`} style={styles.image} />
    <View style={styles.body}>
      <Text style={styles.brand}>{product.brand} · DEMO</Text>
      <Text style={styles.title}>{product.title}</Text>
      <View style={styles.meta}><Text style={styles.price}>${product.price}</Text><Text style={styles.match}>{score}% match</Text></View>
      <Text style={styles.reasons}>{reasons.slice(0, 2).join(" · ")}</Text>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={saved ? `${product.title} saved to RARELY` : `Save ${product.title} to RARELY`} accessibilityState={{ selected: saved }} disabled={saved} onPress={onSave} style={({ pressed }) => [styles.save, saved && styles.saved, pressed && styles.pressed]}><Text style={[styles.saveText, saved && styles.savedText]}>{saved ? "Saved ✓" : "Save"}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Dismiss ${product.title} recommendation`} onPress={onDismiss} style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}><Text style={styles.dismissText}>Dismiss</Text></Pressable>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { width: 254, marginRight: 12, borderRadius: 20, borderWidth: 1, borderColor: "#E7DDD7", backgroundColor: "#FFF", overflow: "hidden" },
  image: { width: "100%", height: 168 },
  body: { padding: 14, gap: 7 },
  brand: { color: "#8A7E84", fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  title: { color: "#2B1D2F", fontWeight: "800", fontSize: 16, lineHeight: 21 },
  meta: { flexDirection: "row", justifyContent: "space-between" },
  price: { color: "#2B1D2F", fontWeight: "800", fontSize: 13 },
  match: { color: "#B96861", fontWeight: "900", fontSize: 12 },
  reasons: { color: "#6F6570", fontSize: 11, lineHeight: 16, minHeight: 32 },
  actions: { flexDirection: "row", gap: 8 },
  save: { flex: 1, minHeight: 40, paddingHorizontal: 10, borderRadius: 11, backgroundColor: "#2B1D2F", alignItems: "center", justifyContent: "center" },
  saved: { backgroundColor: "#E1F0E5" },
  saveText: { color: "#FFF8F0", fontSize: 12, fontWeight: "900" },
  savedText: { color: "#277248" },
  dismiss: { minHeight: 40, paddingHorizontal: 11, borderRadius: 11, borderWidth: 1, borderColor: "#E5DAD4", alignItems: "center", justifyContent: "center" },
  dismissText: { color: "#7A5B59", fontSize: 11, fontWeight: "900" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
