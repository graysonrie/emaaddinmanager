import { useEffect, useState } from "react";

import { UserModel } from "../models/user.model";
import { useKeyValueSubscription } from "./useKeyValueSubscription";
import { useConfigValue } from "./config/useConfigValue";
import { AllPublicAddinPermissions } from "@/lib/addins/addin-management/types";
import {
  UserResponseModel,
  UserRole,
} from "../server/hooks/user/responses/user-response.model";
import getServerCommands from "../server/getServerCommands";

export default function useUserPermissions() {
  // If the user is undefined, it means that they do not exist
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserResponseModel | undefined>(undefined);

  const {
    getSelf,
    createSelf,
    createSelfAsAdmin /*setAllowedAddinPathsForUser */,
  } = getServerCommands();

  const registerUser = async (userName: string, discipline: string) => {
    let user: UserResponseModel;
    try {
      user = await createSelf({ name: userName, disciplines: [discipline] });
    } catch (error) {
      console.warn("Failed to register user. Getting existing user:", error);
      try {
        user = await getSelf();
      } catch (error) {
        console.warn("Failed to get existing user:", error);
        throw new Error("Failed to get existing user");
      }
    }

    // Get permissions from packages
    // const permissions = await AllPublicAddinPermissions();
    // const permission = permissions.find(
    //   (permission) => permission.forDiscipline === discipline
    // );
    // if (!permission) {
    //   throw new Error(`No permission found for discipline: ${discipline}`);
    // }
    return user;
  };

  const registerAdminUser = async (
    userName: string,
    discipline: string,
    role: UserRole,
    key: string
  ) => {
    let user: UserResponseModel;
    try {
      user = await createSelfAsAdmin({
        name: userName,
        disciplines: [discipline],
        role,
        adminKey: key,
      });
    } catch (error) {
      console.warn(
        "Failed to register admin user. Getting existing user:",
        error
      );
      try {
        user = await getSelf();
      } catch (error) {
        console.warn("Failed to get existing admin user:", error);
        throw new Error("Failed to get existing user");
      }
    }

    // Get permissions from packages
    // const permissions = await AllPublicAddinPermissions();
    // const permission = permissions.find(
    //   (permission) => permission.forDiscipline === discipline
    // );
    // if (!permission) {
    //   throw new Error(`No permission found for discipline: ${discipline}`);
    // }
    return user;
  };

  const addAllowedAddinPaths = async (
    user: UserResponseModel,
    addinPaths: string[]
  ) => {
    // const newUser = {
    //   ...user,
    //   allowedAddinPaths: [...user.allowedAddinPaths, ...addinPaths],
    // };
    // await setAllowedAddinPathsForUser(user.userEmail, addinPaths);
  };

  useEffect(() => {
    getSelf()
      .then((userData) => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn("Failed to get user:", error);
        setUser(undefined);
        setIsLoading(false);
      });

    return () => {};
  }, []);

  return {
    user,
    isLoading,
    registerUser,
    registerAdminUser,
  };
}
