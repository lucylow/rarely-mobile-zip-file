import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { createAppleLoginState } from '../src/release/v2/auth/appleState';

export function ProductionAppleSignIn({ onCredential }: { onCredential: (credential: AppleAuthentication.AppleAuthenticationCredential, state: { nonce: string; state: string }) => Promise<void> }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    void AppleAuthentication.isAvailableAsync().then((value) => { if (active) setAvailable(value); });
    return () => { active = false; };
  }, []);

  if (!available) return null;
  return (
    <View style={{ minHeight: 44 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={10}
        style={{ width: '100%', height: 44 }}
        onPress={async () => {
          const state = createAppleLoginState();
          try {
            const credential = await AppleAuthentication.signInAsync({ requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL, AppleAuthentication.AppleAuthenticationScope.FULL_NAME] });
            await onCredential(credential, state);
          } catch (error) {
            if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
            Alert.alert('Sign in unavailable', 'We could not finish Apple sign in. Please try again.');
          }
        }}
      />
    </View>
  );
}
