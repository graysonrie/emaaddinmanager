import { UpdateNotificationModel } from "@/lib/models/update-notification.model";

import { create } from "zustand";
import { UpdateNotificationWithTime } from "./update-notification-with-time.model";

interface AddinUpdaterStore {
  updateNotifications: UpdateNotificationWithTime[];
  addUpdateNotifications: (
    newUpdateNotifications: UpdateNotificationModel[]
  ) => void;
  clearUpdateNotifications: () => void;
  hasUserCheckedNotifications: boolean;
  setCheckedNotifications: () => void;
}

export const useAddinUpdaterStore = create<AddinUpdaterStore>((set, get) => ({
  updateNotifications: [],
  addUpdateNotifications: (newUpdateNotifications: UpdateNotificationModel[]) =>
    set((state) => {
      set({ hasUserCheckedNotifications: false });
      const existingTitles = new Set(
        state.updateNotifications.map((n) => n.title)
      );
      const uniqueNewNotifications = newUpdateNotifications.filter(
        (notification) => !existingTitles.has(notification.title)
      );

      return {
        updateNotifications: [
          ...uniqueNewNotifications.map((notification) => ({
            ...notification,
            time: new Date(),
          })),
          ...state.updateNotifications,
        ],
      };
    }),
  clearUpdateNotifications: () => set({ updateNotifications: [] }),
  hasUserCheckedNotifications: false,
  setCheckedNotifications: () => set({ hasUserCheckedNotifications: true }),
}));
