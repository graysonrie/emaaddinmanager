import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { create } from "zustand";
import { eventBus, EVENTS } from "../events/eventBus";

interface NotificationsStore {
  addinUpdateNotifications: UpdateNotificationModel[];
  setAddinUpdateNotifications: (
    notifications: UpdateNotificationModel[]
  ) => void;
  hasUserCheckedNotifications: boolean;
  setCheckedNotifications: () => void;
}

export const useMockNotificationsStore = create<NotificationsStore>((set) => {
  return {
    addinUpdateNotifications: [
      {
        id: "1",
        name: "Addin 1",
        version: "1.0.0",
        addinName: "Addin 1",
        addinVendorId: "1",
        addinVendorEmail: "test@test.com",
      },
      {
        id: "2",
        name: "Addin 2",
        version: "1.0.0",
        addinName: "Addin 2",
        addinVendorId: "2",
        addinVendorEmail: "test2@test.com",
      },
      {
        id: "3",
        name: "Addin 3",
        version: "1.0.0",
        addinName: "Addin 3",
        addinVendorId: "3",
        addinVendorEmail: "test3@test.com",
      },
    ],
    setAddinUpdateNotifications: (notifications: UpdateNotificationModel[]) =>
      set({
        addinUpdateNotifications: notifications,
        hasUserCheckedNotifications: false,
      }),
    hasUserCheckedNotifications: false,
    setCheckedNotifications: () => set({ hasUserCheckedNotifications: false }),
  };
});
