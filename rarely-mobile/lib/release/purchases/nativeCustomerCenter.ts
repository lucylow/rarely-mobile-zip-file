import RevenueCatUI from "react-native-purchases-ui";

export function createNativeCustomerCenterGateway() {
  return {
    async present(): Promise<void> {
      await RevenueCatUI.presentCustomerCenter();
    },
  };
}
