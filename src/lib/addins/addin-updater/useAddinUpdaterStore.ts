import { UpdateNotificationModel } from "@/lib/models/update-notification.model";

import { create } from "zustand";

interface AddinUpdaterStore {
  updateNotifications: UpdateNotificationModel[];
  setUpdateNotifications: (updateNotifications: UpdateNotificationModel[]) => void;
}

export const useAddinUpdaterStore = create<AddinUpdaterStore>((set) => ({
  updateNotifications: [],
  setUpdateNotifications: (updateNotifications: UpdateNotificationModel[]) => set({ updateNotifications }),
}));