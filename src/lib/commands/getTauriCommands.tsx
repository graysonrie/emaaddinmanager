import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";
import { AddinModel } from "@/lib/models/addin.model";
import { InstallAddinRequestModel } from "../models/install-addin-request.model";
import { SimplifiedAddinInfoModel } from "../models/simplified-addin-info.model";
import { DllModel } from "../models/dll.model";
import { CategoryModel } from "../models/category.model";
import { ErrorList } from "@/types/error-list";
import { UninstallAddinRequestModel } from "../models/uninstall-addin-request.model";
import { UserStatsModel } from "../models/user-stats.model";
import { UpdateNotificationModel } from "../models/update-notification.model";
import { UserModel } from "../models/user.model";

interface TauriCommands {
  kvStoreSet: (key: string, value: any) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
  getAddins: (path: string) => Promise<AddinModel[]>;
  getLocalAddins: () => Promise<AddinModel[]>;
  getRevitVersions: () => Promise<string[]>;
  installAddins: (installRequests: InstallAddinRequestModel[]) => Promise<void>;
  delistAddin: (addin: AddinModel, registryPath: string) => Promise<void>;
  getCategories: (path: string) => Promise<CategoryModel[]>;
  uninstallAddins: (
    uninstallRequests: UninstallAddinRequestModel[]
  ) => Promise<void>;
  exportAddin: (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => Promise<ErrorList>;
  getAddinFileInfo: (projectDir: string) => Promise<SimplifiedAddinInfoModel>;
  getAllProjectDlls: (projectDir: string) => Promise<DllModel[]>;
  buildAddin: (projectDir: string) => Promise<string>;
  createUserStats: () => Promise<UserStatsModel>;
  updateUserStats: () => Promise<UserStatsModel | undefined>;
  getAllUserStats: () => Promise<UserStatsModel[]>;
  doesUserExist: (userEmail: string) => Promise<boolean>;
  changeUserStatsEmail: (newUserEmail: string) => Promise<void>;
  changeUserStatsName: (newUserName: string) => Promise<void>;
  /** Returns true if there are updates available */
  checkForUpdatesManual: () => Promise<boolean>;
  isRevitRunning: () => Promise<boolean>;
  getPendingUpdatesInfo: () => Promise<string | undefined>;
  registerUser: (
    userEmail: string,
    userName: string,
    discipline: string
  ) => Promise<UserModel>;
  getUser: (userEmail: string) => Promise<UserModel | undefined>;
  addAllowedAddinPaths: (
    userEmail: string,
    addinPaths: string[]
  ) => Promise<void>;
  removeAllowedAddinPaths: (
    userEmail: string,
    addinPaths: string[]
  ) => Promise<void>;
  isUserAdmin: () => Promise<boolean>;
  isUserSuperAdmin: () => Promise<boolean>;

  isOtherUserAdmin: (userEmail: string) => Promise<boolean>;
  isOtherUserSuperAdmin: (userEmail: string) => Promise<boolean>;
  /** Remove the user from the stats db so that they do not appear at all on the stats page. This is only available to admins. */
  unregisterUser: (userEmail: string) => Promise<void>;
}

export default function getTauriCommands(): TauriCommands {
  const kvStoreSet = async (key: string, value: any) => {
    await invoke<void>("kv_store_set", {
      key,
      value,
    });
    console.log(`KV Store - Set key: ${key} value:`, value);
  };

  const kvStoreGet = async <T,>(key: string): Promise<T | undefined> => {
    try {
      const data = await invoke<T>("kv_store_get", { key });
      return data;
    } catch (err) {
      console.log(err);
    }
    return undefined;
  };

  const kvStoreSubscribeToKey = async <T,>(
    key: string
  ): Promise<KvSubscriptionModel<T>> => {
    return await invoke<KvSubscriptionModel<T>>("kv_store_subscribe_to_key", {
      key,
    });
  };

  const getAddins = async (path: string) => {
    try {
      return await invoke<AddinModel[]>("get_addins", { path });
    } catch (err) {
      console.error("Failed to get addins:", err);
      return [];
    }
  };

  const getLocalAddins = async () => {
    try {
      return await invoke<AddinModel[]>("get_local_addins");
    } catch (err) {
      console.error("Failed to get local addins:", err);
      throw err;
    }
  };

  const getRevitVersions = async () => {
    try {
      return await invoke<string[]>("get_revit_versions");
    } catch (err) {
      console.error("Failed to get Revit versions:", err);
      throw err;
    }
  };

  // Installs the addin for the given Revit versions locally
  const installAddins = async (installRequests: InstallAddinRequestModel[]) => {
    try {
      return await invoke<void>("install_addins", { installRequests });
    } catch (err) {
      console.error("Failed to install addin:", err);
      throw err;
    }
  };

  const delistAddin = async (addin: AddinModel, registryPath: string) => {
    try {
      return await invoke<void>("delist_addin", { addin, registryPath });
    } catch (err) {
      console.error("Failed to delist addin:", err);
      throw err;
    }
  };

  const getCategories = async (path: string) => {
    try {
      return await invoke<CategoryModel[]>("get_categories", { path });
    } catch (err) {
      console.error("Failed to get categories:", err);
      throw err;
    }
  };

  // Uninstalls the addin for the given Revit versions locally
  const uninstallAddins = async (
    uninstallRequests: UninstallAddinRequestModel[]
  ) => {
    try {
      return await invoke<void>("uninstall_addins", { uninstallRequests });
    } catch (err) {
      console.warn("Failed to uninstall addin:", err);
      throw err;
    }
  };

  const exportAddin = async (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => {
    return await invoke<ErrorList>("export_addin", {
      projectDir,
      addinFileInfo,
      extraDlls,
      destinationDir,
    });
  };

  const getAddinFileInfo = async (projectDir: string) => {
    return await invoke<SimplifiedAddinInfoModel>("get_addin_file_info", {
      projectDir,
    });
  };

  const getAllProjectDlls = async (projectDir: string) => {
    return await invoke<DllModel[]>("get_all_project_dlls", { projectDir });
  };

  const buildAddin = async (projectDir: string) => {
    return await invoke<string>("build_addin", { projectDir });
  };

  const createUserStats = async () => {
    return await invoke<UserStatsModel>("create_user_stats");
  };

  const updateUserStats = async () => {
    return await invoke<UserStatsModel | undefined>("update_user_stats");
  };

  const doesUserExist = async (userEmail: string) => {
    return await invoke<boolean>("does_user_exist", { userEmail });
  };

  const getAllUserStats = async () => {
    return await invoke<UserStatsModel[]>("get_all_user_stats");
  };

  const changeUserStatsEmail = async (newUserEmail: string) => {
    return await invoke<void>("change_user_stats_email", { newUserEmail });
  };

  const changeUserStatsName = async (newUserName: string) => {
    return await invoke<void>("change_user_stats_name", { newUserName });
  };

  const checkForUpdatesManual = async () => {
    return await invoke<boolean>("check_for_updates_manual");
  };

  const isRevitRunning = async () => {
    return await invoke<boolean>("is_revit_running");
  };

  const getPendingUpdatesInfo = async () => {
    return await invoke<string | undefined>("get_pending_updates_info");
  };

  const registerUser = async (
    userEmail: string,
    userName: string,
    userDiscipline: string
  ) => {
    return await invoke<UserModel>("register_user", {
      userEmail,
      userName,
      userDiscipline,
    });
  };

  const getUser = async (userEmail: string) => {
    return await invoke<UserModel | undefined>("get_user", { userEmail });
  };

  const addAllowedAddinPaths = async (
    userEmail: string,
    addinPaths: string[]
  ) => {
    return await invoke<void>("add_allowed_addin_paths", {
      userEmail,
      addinPaths,
    });
  };

  const removeAllowedAddinPaths = async (
    userEmail: string,
    addinPaths: string[]
  ) => {
    return await invoke<void>("remove_allowed_addin_paths", {
      userEmail,
      addinPaths,
    });
  };

  const isUserAdmin = async () => {
    return await invoke<boolean>("is_user_admin");
  };

  const isUserSuperAdmin = async () => {
    return await invoke<boolean>("is_user_super_admin");
  };

  const isOtherUserAdmin = async (userEmail: string) => {
    return await invoke<boolean>("is_other_user_admin", { userEmail });
  };

  const isOtherUserSuperAdmin = async (userEmail: string) => {
    return await invoke<boolean>("is_other_user_super_admin", { userEmail });
  };

  const unregisterUser = async (userEmail: string) => {
    return await invoke<void>("unregister_user", { userEmail });
  };

  return {
    kvStoreSet,
    kvStoreGet,
    kvStoreSubscribeToKey,
    getAddins,
    getLocalAddins,
    getRevitVersions,
    installAddins,
    delistAddin,
    getCategories,
    uninstallAddins,
    exportAddin,
    getAddinFileInfo,
    getAllProjectDlls,
    buildAddin,
    createUserStats,
    doesUserExist,
    updateUserStats,
    getAllUserStats,
    changeUserStatsEmail,
    changeUserStatsName,
    checkForUpdatesManual,
    isRevitRunning,
    getPendingUpdatesInfo,
    registerUser,
    getUser,
    addAllowedAddinPaths,
    removeAllowedAddinPaths,
    isUserAdmin,
    isUserSuperAdmin,
    isOtherUserAdmin,
    isOtherUserSuperAdmin,
    unregisterUser,
  };
}
