import { create } from "zustand";
import { UpdateNotificationModel } from "../../models/update-notification.model";
import getTauriCommands from "../../commands/getTauriCommands";
import { eventBus, EVENTS } from "../../events/eventBus";

interface AddinUpdaterState {
  updateNotifications: UpdateNotificationModel[];
  isChecking: boolean;
  lastCheckTime: Date | null;
  checkIntervalMs: number;
  isPeriodicCheckingActive: boolean;
  intervalId: NodeJS.Timeout | null;
}

interface AddinUpdaterActions {
  setCheckInterval: (intervalMs: number) => void;
  checkForUpdates: () => Promise<void>;
  startPeriodicChecking: () => void;
  stopPeriodicChecking: () => void;
  clearNotifications: () => void;
}

type AddinUpdaterStore = AddinUpdaterState & AddinUpdaterActions;

export const useAddinUpdaterStore = create<AddinUpdaterStore>((set, get) => ({
  // State
  updateNotifications: [],
  isChecking: false,
  lastCheckTime: null,
  checkIntervalMs: 5 * 60 * 1000, // 5 minutes default
  isPeriodicCheckingActive: false,
  intervalId: null,

  // Actions
  setCheckInterval: (intervalMs: number) => {
    set({ checkIntervalMs: intervalMs });
  },

  checkForUpdates: async () => {
    const { isChecking } = get();
    if (isChecking) return; // Prevent concurrent checks

    set({ isChecking: true });

    try {
      const notifications = await getTauriCommands().checkForUpdates();
      console.log("Update Notifications:", notifications);

      // Emit event for other parts of the app to listen to
      eventBus.emit(EVENTS.ADDIN_UPDATES_AVAILABLE, notifications);

      set({
        updateNotifications: notifications,
        lastCheckTime: new Date(),
      });
    } catch (error) {
      console.error("Failed to check for updates:", error);
    } finally {
      set({ isChecking: false });
    }
  },

  startPeriodicChecking: () => {
    const {
      isPeriodicCheckingActive,
      intervalId,
      checkIntervalMs,
      checkForUpdates,
    } = get();

    if (isPeriodicCheckingActive || intervalId) return; // Already running

    // Check immediately
    checkForUpdates();

    // Set up interval
    const newIntervalId = setInterval(() => {
      get().checkForUpdates();
    }, checkIntervalMs);

    set({
      intervalId: newIntervalId,
      isPeriodicCheckingActive: true,
    });
  },

  stopPeriodicChecking: () => {
    const { intervalId } = get();

    if (intervalId) {
      clearInterval(intervalId);
    }

    set({
      intervalId: null,
      isPeriodicCheckingActive: false,
    });
  },

  clearNotifications: () => {
    set({ updateNotifications: [] });
  },
}));

// Convenience hook for components that only need to read state
export const useAddinUpdater = () => {
  const store = useAddinUpdaterStore();

  return {
    updateNotifications: store.updateNotifications,
    isChecking: store.isChecking,
    lastCheckTime: store.lastCheckTime,
    isPeriodicCheckingActive: store.isPeriodicCheckingActive,
    checkForUpdates: store.checkForUpdates,
    startPeriodicChecking: store.startPeriodicChecking,
    stopPeriodicChecking: store.stopPeriodicChecking,
    clearNotifications: store.clearNotifications,
  };
};
