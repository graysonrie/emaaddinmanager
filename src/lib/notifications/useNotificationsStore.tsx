import { UpdateNotificationModel } from "@/lib/models/update-notification.model";
import { create } from "zustand";
import { eventBus, EVENTS } from "../events/eventBus";
import { deduplicateAddinUpdateNotifications } from "./helpers";

interface NotificationsStore {
  addinUpdateNotifications: UpdateNotificationModel[];
  setAddinUpdateNotifications: (
    notifications: UpdateNotificationModel[]
  ) => void;
  hasUserCheckedNotifications: boolean;
  setCheckedNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => {
  // Listen for addin update events
  eventBus.on(
    EVENTS.ADDIN_UPDATES_AVAILABLE,
    (notifications: UpdateNotificationModel[]) => {
      // Deduplicate notifications since if an addin is installed for multiple versions, it will be notified multiple times
      const deduplicatedNotifications =
        deduplicateAddinUpdateNotifications(notifications);
      set({
        addinUpdateNotifications: deduplicatedNotifications,
        hasUserCheckedNotifications: false,
      });
    }
  );

  return {
    addinUpdateNotifications: [],
    setAddinUpdateNotifications: (notifications: UpdateNotificationModel[]) =>
      set({
        addinUpdateNotifications: notifications,
        hasUserCheckedNotifications: false,
      }),
    hasUserCheckedNotifications: false,
    setCheckedNotifications: () =>
      set({
        hasUserCheckedNotifications: true,
        addinUpdateNotifications: [],
      }),
  };
});
