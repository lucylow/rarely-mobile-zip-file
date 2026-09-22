import type { StoreKitGateway } from './gateway';

export interface GatewayFactories {
  native: () => StoreKitGateway;
  mock: () => StoreKitGateway;
}

export function createGateway(environment: 'development' | 'preview' | 'production', factories: GatewayFactories): StoreKitGateway {
  return environment === 'production' ? factories.native() : factories.mock();
}
