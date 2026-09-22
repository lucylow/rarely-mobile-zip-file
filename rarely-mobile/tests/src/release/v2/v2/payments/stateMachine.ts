export type PurchaseState =
  | 'idle'
  | 'loading-products'
  | 'ready'
  | 'purchasing'
  | 'pending'
  | 'restoring'
  | 'success'
  | 'cancelled'
  | 'unavailable'
  | 'failed';

export interface PurchaseContext {
  state: PurchaseState;
  productId?: string;
  errorCode?: string;
  updatedAt: number;
}

export type PurchaseEvent =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS' }
  | { type: 'LOAD_FAILURE'; code: string }
  | { type: 'BUY_START'; productId: string }
  | { type: 'BUY_PENDING' }
  | { type: 'BUY_SUCCESS' }
  | { type: 'BUY_CANCELLED' }
  | { type: 'BUY_FAILURE'; code: string }
  | { type: 'RESTORE_START' }
  | { type: 'RESTORE_SUCCESS' }
  | { type: 'RESTORE_FAILURE'; code: string }
  | { type: 'RESET' };

export function reducePurchase(state: PurchaseContext, event: PurchaseEvent, now = Date.now()): PurchaseContext {
  switch (event.type) {
    case 'LOAD_START': return { state: 'loading-products', updatedAt: now };
    case 'LOAD_SUCCESS': return { state: 'ready', updatedAt: now };
    case 'LOAD_FAILURE': return { state: 'unavailable', errorCode: event.code, updatedAt: now };
    case 'BUY_START': return { state: 'purchasing', productId: event.productId, updatedAt: now };
    case 'BUY_PENDING': return { ...state, state: 'pending', updatedAt: now };
    case 'BUY_SUCCESS': return { ...state, state: 'success', updatedAt: now };
    case 'BUY_CANCELLED': return { ...state, state: 'cancelled', updatedAt: now };
    case 'BUY_FAILURE': return { ...state, state: 'failed', errorCode: event.code, updatedAt: now };
    case 'RESTORE_START': return { ...state, state: 'restoring', updatedAt: now };
    case 'RESTORE_SUCCESS': return { ...state, state: 'success', updatedAt: now };
    case 'RESTORE_FAILURE': return { ...state, state: 'failed', errorCode: event.code, updatedAt: now };
    case 'RESET': return { state: 'idle', updatedAt: now };
  }
}

export function canStartPurchase(state: PurchaseState): boolean {
  return state === 'ready' || state === 'cancelled' || state === 'failed';
}
