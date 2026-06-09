import { HelpTicketUpdateNotificationModel } from "@/lib/models/help-tickets/help-ticket-update-notification.model";
import { create } from "zustand";
import { HelpTicketNotificationWithTime } from "./help-ticket-notification-with-time.model";

export function helpTicketNotificationKey(
  notification: HelpTicketUpdateNotificationModel,
) {
  return `${notification.ticketId}:${notification.updateType}:${notification.updatedAtExact}`;
}

interface HelpTicketNotificationsStore {
  notifications: HelpTicketNotificationWithTime[];
  addNotifications: (
    newNotifications: HelpTicketUpdateNotificationModel[],
  ) => void;
  clearNotifications: () => void;
  dismissNotification: (key: string) => void;
}

export const useHelpTicketNotificationsStore =
  create<HelpTicketNotificationsStore>((set) => ({
    notifications: [],

    addNotifications: (newNotifications) =>
      set((state) => {
        const notificationMap = new Map<string, HelpTicketNotificationWithTime>();

        state.notifications.forEach((notification) => {
          notificationMap.set(helpTicketNotificationKey(notification), notification);
        });

        newNotifications.forEach((notification) => {
          notificationMap.set(helpTicketNotificationKey(notification), {
            ...notification,
            time: new Date(notification.updatedAtExact),
          });
        });

        const merged = Array.from(notificationMap.values()).sort(
          (a, b) => b.time.getTime() - a.time.getTime(),
        );

        return { notifications: merged };
      }),

    clearNotifications: () => set({ notifications: [] }),

    dismissNotification: (key) =>
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => helpTicketNotificationKey(notification) !== key,
        ),
      })),
  }));
