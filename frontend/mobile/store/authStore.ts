/**
 * store/authStore.ts
 *
 * Zustand auth store with AsyncStorage persistence.
 * The token survives app restarts — rehydration happens automatically
 * via `hydrate()` which should be called once in your root _layout.tsx.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

type AuthState = {
  token:     string | null;
  hydrated:  boolean;           // true once AsyncStorage has been read

  setToken:  (token: string | null) => Promise<void>;
  clearToken: () => Promise<void>;
  hydrate:   () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token:    null,
  hydrated: false,

  /** Persist a new token (or clear by passing null). */
  setToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    set({ token });
  },

  /** Convenience logout helper — clears storage and resets state. */
  clearToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },

  /**
   * Read the persisted token from AsyncStorage.
   * Call this ONCE at app startup (root _layout.tsx) before rendering
   * any protected screens.
   */
  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      set({ token: token ?? null, hydrated: true });
    } catch {
      set({ hydrated: true }); // still mark hydrated so the app doesn't hang
    }
  },
}));