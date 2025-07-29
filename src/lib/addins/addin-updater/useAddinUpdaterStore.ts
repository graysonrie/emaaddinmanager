import { UpdateNotificationModel } from "@/lib/models/update-notification.model";

import { create } from "zustand";
import { UpdateNotificationWithTime } from "./update-notification-with-time.model";

interface AddinUpdaterStore {
  updateNotifications: UpdateNotificationWithTime[];
  pendingNotifications: UpdateNotificationModel[];
  addUpdateNotifications: (
    newUpdateNotifications: UpdateNotificationModel[]
  ) => void;
  clearUpdateNotifications: () => void;
  hasUserCheckedNotifications: boolean;
  setCheckedNotifications: () => void;
  // Debounced notification methods
  addPendingNotifications: (notifications: UpdateNotificationModel[]) => void;
  flushPendingNotifications: () => UpdateNotificationModel[];
  clearPendingNotifications: () => void;
}

export const useAddinUpdaterStore = create<AddinUpdaterStore>((set, get) => ({
  updateNotifications: [],
  pendingNotifications: [],
  addUpdateNotifications: (newUpdateNotifications: UpdateNotificationModel[]) =>
    set((state) => {
      set({ hasUserCheckedNotifications: false });

      // Create a Map to track the latest notification for each title
      const notificationMap = new Map<string, UpdateNotificationWithTime>();

      // Add existing notifications to the map (keeping the latest one for each title)
      state.updateNotifications.forEach((notification) => {
        const existing = notificationMap.get(notification.title);
        if (!existing || notification.time > existing.time) {
          notificationMap.set(notification.title, notification);
        }
      });

      // Add new notifications to the map (they will override existing ones if newer)
      newUpdateNotifications.forEach((notification) => {
        const existing = notificationMap.get(notification.title);
        const newNotificationWithTime = {
          ...notification,
          time: new Date(),
        };

        if (!existing || newNotificationWithTime.time > existing.time) {
          notificationMap.set(notification.title, newNotificationWithTime);
        }
      });

      // Convert map back to array and sort by time (newest first)
      const deduplicatedNotifications = Array.from(
        notificationMap.values()
      ).sort((a, b) => b.time.getTime() - a.time.getTime());

      return {
        updateNotifications: deduplicatedNotifications,
      };
    }),
  clearUpdateNotifications: () => set({ updateNotifications: [] }),
  hasUserCheckedNotifications: false,
  setCheckedNotifications: () => set({ hasUserCheckedNotifications: true }),

  // Debounced notification methods
  addPendingNotifications: (notifications: UpdateNotificationModel[]) =>
    set((state) => ({
      pendingNotifications: [...state.pendingNotifications, ...notifications],
    })),

  flushPendingNotifications: (): UpdateNotificationModel[] => {
    const state = get();
    if (state.pendingNotifications.length > 0) {
      // Deduplicate pending notifications by title
      const notificationMap = new Map<string, UpdateNotificationModel>();
      state.pendingNotifications.forEach((notification) => {
        notificationMap.set(notification.title, notification);
      });

      const deduplicatedPending = Array.from(notificationMap.values());

      // Add to main notifications and clear pending
      state.addUpdateNotifications(deduplicatedPending);
      set({ pendingNotifications: [] });

      return deduplicatedPending;
    }
    return [];
  },

  clearPendingNotifications: () => set({ pendingNotifications: [] }),
}));
