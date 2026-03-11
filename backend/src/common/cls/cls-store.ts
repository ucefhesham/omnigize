import { AsyncLocalStorage } from 'async_hooks';

export interface ClsStore {
  workspaceId?: string;
  userId?: string;
}

export const clsStore = new AsyncLocalStorage<ClsStore>();

export function getWorkspaceId(): string | undefined {
  return clsStore.getStore()?.workspaceId;
}

export function getUserId(): string | undefined {
  return clsStore.getStore()?.userId;
}
