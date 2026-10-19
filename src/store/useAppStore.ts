import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  installedAppIds: string[];
  installApp: (id: string) => void;
  uninstallApp: (id: string) => void;
  isInstalled: (id: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      installedAppIds: [
        'core-chat', 
        'business-advisory', 
        'marketing', 
        'automation', 
        'content-studio', 
        'support', 
        'strategy', 
        'settings'
      ],
      installApp: (id) => set((state) => ({
        installedAppIds: state.installedAppIds.includes(id) 
          ? state.installedAppIds 
          : [...state.installedAppIds, id]
      })),
      uninstallApp: (id) => set((state) => ({
        installedAppIds: state.installedAppIds.filter((appId) => appId !== id || appId === 'core-chat')
      })),
      isInstalled: (id) => get().installedAppIds.includes(id),
    }),
    {
      name: 'ayech-ai-storage',
    }
  )
);
