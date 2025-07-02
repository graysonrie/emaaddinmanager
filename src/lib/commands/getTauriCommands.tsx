import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";
import { AddinModel } from "@/lib/models/addin.model";
import { InstallAddinRequestModel } from "../models/install-addin-request.model";
import { SimplifiedAddinInfoModel } from "../models/simplified-addin-info.model";
import { DllModel } from "../models/dll.model";
import { CategoryModel } from "../models/category.model";

interface TauriCommands {
  kvStoreSet: (key: string, value: any) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
  getAddins: (path: string) => Promise<AddinModel[]>;
  getLocalAddins: () => Promise<AddinModel[]>;
  getRevitVersions: () => Promise<string[]>;
  installAddin: (installRequest: InstallAddinRequestModel) => Promise<void>;
  getCategories: (path: string) => Promise<CategoryModel[]>;
  uninstallAddin: (installRequest: InstallAddinRequestModel) => Promise<void>;
  exportAddin: (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => Promise<void>;
  getAddinFileInfo: (projectDir: string) => Promise<SimplifiedAddinInfoModel>;
  getAllProjectDlls: (projectDir: string) => Promise<DllModel[]>;
  buildAddin: (projectDir: string) => Promise<string>;
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
  const installAddin = async (installRequest: InstallAddinRequestModel) => {
    try {
      return await invoke<void>("install_addin", { installRequest });
    } catch (err) {
      console.error("Failed to install addin:", err);
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
  const uninstallAddin = async (installRequest: InstallAddinRequestModel) => {
    try {
      return await invoke<void>("uninstall_addin", { installRequest });
    } catch (err) {
      console.error("Failed to uninstall addin:", err);
      throw err;
    }
  };

  const exportAddin = async (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string
  ) => {
    return await invoke<void>("export_addin", {
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

  return {
    kvStoreSet,
    kvStoreGet,
    kvStoreSubscribeToKey,
    getAddins,
    getLocalAddins,
    getRevitVersions,
    installAddin,
    getCategories,
    uninstallAddin,
    exportAddin,
    getAddinFileInfo,
    getAllProjectDlls,
    buildAddin,
  };
}
