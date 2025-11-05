import getTauriCommands from "@/lib/commands/getTauriCommands";
import { useEnableAllAddinModalStore } from "./enable-all-modal-store";

export default function useManageAddins() {
  // The addin in question
  const { addinModel, addinPermissionModel } = useEnableAllAddinModalStore();

  async function enableForAllUsers() {
    if (!addinModel || !addinPermissionModel)
      throw new Error("Addin model or addin permission model is not set");
    try {
      const tauriCommands = getTauriCommands();
      const allUsers = await tauriCommands.getAllUserStats();
      allUsers.forEach(async (user) => {
        const userModel = await tauriCommands.getUser(user.userEmail);
        if (userModel != undefined) {
          // Add the path to the user
          const newPaths = [
            ...userModel.allowedAddinPaths,
            addinPermissionModel.relativePathToAddin,
          ];
          //   console.log(
          //     "Preparing to set allowed addin paths for user:",
          //     user.userEmail,
          //     "with paths:",
          //     newPaths
          //   );
          await tauriCommands.setAllowedAddinPathsForUser(
            user.userEmail,
            newPaths
          );
        } else {
          // Could not get user
          console.warn(
            "useManageAddins:enableForAllUsers: Tried getting user with email but didn't exist.",
            user.userEmail
          );
        }
      });
    } catch (error) {
      console.error("Failed to enable for all users:", error);
      throw error;
    }
  }

  async function disableForAllUsers() {
    if (!addinModel || !addinPermissionModel)
      throw new Error("Addin model or addin permission model is not set");
    try {
      const tauriCommands = getTauriCommands();
      const allUsers = await tauriCommands.getAllUserStats();
      allUsers.forEach(async (user) => {
        const userModel = await tauriCommands.getUser(user.userEmail);
        if (userModel != undefined) {
          // Remove the path from the user
          const newPaths = [
            ...userModel.allowedAddinPaths.filter(
              (path) => path !== addinPermissionModel.relativePathToAddin
            ),
          ];
          //   console.log("Preparing to set allowed addin paths for user:", user.userEmail, "with paths:", newPaths);
          await tauriCommands.setAllowedAddinPathsForUser(
            user.userEmail,
            newPaths
          );
        } else {
          // Could not get user
          console.warn(
            "useManageAddins:disableForAllUsers: Tried getting user with email but didn't exist.",
            user.userEmail
          );
        }
      });
    } catch (error) {
      console.error("Failed to disable for all users:", error);
      throw error;
    }
  }

  return {
    enableForAllUsers,
    disableForAllUsers,
  };
}
