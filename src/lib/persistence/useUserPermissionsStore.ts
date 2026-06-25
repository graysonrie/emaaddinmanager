import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { UserModel } from "../models/user.model";
import getTauriCommands from "../commands/getTauriCommands";
import { useKeyValueStore } from "./useKeyValueStore";
import { AllPublicAddinPermissions } from "@/lib/addins/addin-management/types";
import { useSetupStore } from "@/app/dashboard/setup/store";

interface UserPermissionsStore {
  user: UserModel | undefined;
  isLoading: boolean;
  registerAndAddAllowedAddinPaths: (discipline: string) => Promise<UserModel>;
  addAllowedAddinPaths: (user: UserModel, addinPaths: string[]) => Promise<void>;
  fetchUser: (userEmail: string | undefined) => Promise<void>;
}

export const useUserPermissionsStore = create<UserPermissionsStore>()(
  subscribeWithSelector((set, get) => ({
    user: undefined,
    isLoading: true,
    fetchUser: async (userEmail: string | undefined) => {
      if (!userEmail) {
        set({ user: undefined, isLoading: false });
        return;
      }

      const { user } = get();
      if (user?.userEmail === userEmail) {
        set({ isLoading: false });
        return;
      }

      set({ isLoading: true });
      try {
        const userData = await getTauriCommands().getUser(userEmail);
        set({ user: userData, isLoading: false });
      } catch (error) {
        console.error("Failed to get user:", error);
        set({ user: undefined, isLoading: false });
      }
    },
    registerAndAddAllowedAddinPaths: async (discipline: string) => {
      const userEmail = useKeyValueStore.getState().values.userEmail;
      const userName = useKeyValueStore.getState().values.userName;

      if (!userEmail) {
        throw new Error("User email is not set");
      }
      if (!userName) {
        throw new Error("User name is not set");
      }

      let user: UserModel | undefined;
      try {
        user = await getTauriCommands().registerUser(
          userEmail,
          userName,
          discipline
        );
      } catch (error) {
        console.warn("Failed to register user. Getting existing user:", error);
        user = await getTauriCommands().getUser(userEmail);
      }
      if (!user) {
        throw new Error("Failed to register user");
      }

      // Get permissions from packages
      const permissions = await AllPublicAddinPermissions();
      const permission = permissions.find(
        (permission) => permission.forDiscipline === discipline
      );
      if (!permission) {
        throw new Error(`No permission found for discipline: ${discipline}`);
      }

      await get().addAllowedAddinPaths(user, [permission.relativePathToAddin]);

      // Update the user state so the component knows the user now exists
      console.log("user has been set");
      set({ user, isLoading: false });
      useSetupStore.getState().setUser(user);

      return user;
    },
    addAllowedAddinPaths: async (user: UserModel, addinPaths: string[]) => {
      await getTauriCommands().setAllowedAddinPathsForUser(
        user.userEmail,
        addinPaths
      );
      // Optionally update local state if needed
      const currentUser = get().user;
      if (currentUser && currentUser.userEmail === user.userEmail) {
        set({
          user: {
            ...currentUser,
            allowedAddinPaths: [
              ...currentUser.allowedAddinPaths,
              ...addinPaths,
            ],
          },
        });
      }
    },
  }))
);

