import React, { useState } from "react";
import { ScrollView, Text } from "react-native";
import { ActionButton, ConfirmDialog, DegradedBanner, ReleaseSection } from "../../components/release";
import { deleteAccount } from "../../lib/release/privacy/deleteAccount";

export default function ReleaseDeletionScreen() {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("No deletion requested.");
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}><Text style={{ fontSize: 30, fontWeight: "900" }}>Delete account</Text><ReleaseSection title="Before you continue"><Text>This removes the server account, local private content, session state, and purchase identity associated with this device.</Text></ReleaseSection><DegradedBanner message={status} /><ActionButton title="Delete my account" disabled={busy} onPress={() => setConfirm(true)} /><ConfirmDialog visible={confirm} title="Delete account?" detail="This action removes your account and private data. Export anything you want to keep first." confirmLabel="Delete everything" onCancel={() => setConfirm(false)} onConfirm={async () => { setConfirm(false); setBusy(true); try { await deleteAccount({ deleteServerAccount: async () => {}, wipeLocalData: async () => {}, clearPurchaseIdentity: async () => {}, signOut: async () => {} }, (progress) => setStatus(progress.message)); } catch { setStatus("Deletion could not finish. Contact support with the request time shown in your account history."); } finally { setBusy(false); } }} /></ScrollView>;
}
