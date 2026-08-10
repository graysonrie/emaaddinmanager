import { invoke } from "@tauri-apps/api/core";
import { KvSubscriptionModel } from "../models/kv-subscription-model";
import { AddinModel } from "@/lib/models/addin.model";
import { InstallAddinRequestModel } from "../models/install-addin-request.model";
import { SimplifiedAddinInfoModel } from "../models/simplified-addin-info.model";
import { DllModel } from "../models/dll.model";
import { CategoryModel } from "../models/category.model";
import { ErrorList } from "@/types/error-list";
import { UninstallAddinRequestModel } from "../models/uninstall-addin-request.model";
import {
  UserStatsModel,
  UserStatsSummaryModel,
} from "../models/user-stats.model";
import { UserModel } from "../models/user.model";
import { CreateAddinPackageRequestModel } from "../models/create-addin-package-request.model";
import { AddinPackageInfoModel } from "../models/addin-package-info.model";
import { VsTemplateModel } from "../models/vs-template.model";
import { CodeSnippetModel } from "../models/code-snippet.model";
import { CodeSnippetAndGroupsModel } from "../models/code-snippet-and-groups.model";
import { UserMetadataModel } from "../models/user-metadata.model";
import { CreateHelpTicketRequestModel } from "../models/help-tickets/create-help-ticket-request.model";
import { HelpTicketPreviewModel } from "../models/help-tickets/help-ticket-preview.model";
import { HelpTicketModel } from "../models/help-tickets/help-ticket.model";
import { AddHelpTicketMessageRequestModel } from "../models/help-tickets/add-help-ticket-message-request.model";
import { HelpTicketStatus } from "../models/help-tickets/help-ticket-status";
import { HelpTicketUpdateNotificationModel } from "../models/help-tickets/help-ticket-update-notification.model";
import { ConfigKeys } from "../persistence/config/config-keys";
import { ReplacementYearModel } from "../models/replacement-year.model";

type ConfigKey = keyof ConfigKeys;

interface TauriCommands {
  kvStoreSet: <K extends ConfigKey>(
    key: K,
    value: ConfigKeys[K],
  ) => Promise<void>;
  kvStoreGet: <T>(key: string) => Promise<T | undefined>;
  kvStoreSubscribeToKey<T>(key: string): Promise<KvSubscriptionModel<T>>;
  getAddins: (path: string) => Promise<AddinModel[]>;
  getLocalAddins: () => Promise<AddinModel[]>;
  getRevitVersions: () => Promise<string[]>;
  installAddins: (installRequests: InstallAddinRequestModel[]) => Promise<void>;
  delistAddin: (addin: AddinModel, registryPath: string) => Promise<void>;
  getCategories: (path: string) => Promise<CategoryModel[]>;
  uninstallAddins: (
    uninstallRequests: UninstallAddinRequestModel[],
  ) => Promise<void>;
  exportAddin: (
    projectDir: string,
    addinFileInfo: SimplifiedAddinInfoModel,
    extraDlls: string[],
    destinationDir: string,
  ) => Promise<ErrorList>;
  getAddinFileInfo: (projectDir: string) => Promise<SimplifiedAddinInfoModel>;
  getAllProjectDlls: (projectDir: string) => Promise<DllModel[]>;
  buildAddin: (projectDir: string) => Promise<string>;
  listAddinReplacementYears: (
    destination: string,
    addinName: string,
  ) => Promise<ReplacementYearModel[]>;
  setAddinReplacementDlls: (
    destination: string,
    addinName: string,
    year: string,
    sourcePaths: string[],
  ) => Promise<void>;
  removeAddinReplacementDlls: (
    destination: string,
    addinName: string,
    year: string,
  ) => Promise<void>;
  removeAddinReplacementDllFile: (
    destination: string,
    addinName: string,
    year: string,
    fileName: string,
  ) => Promise<void>;
  createUserStats: () => Promise<UserStatsModel>;
  updateUserStats: () => Promise<UserStatsModel | undefined>;
  /** Uploads the current user's stats without fetching them back. Used by the background updater. */
  syncUserStats: () => Promise<void>;
  getAllUserStats: () => Promise<UserStatsModel[]>;
  /** Lightweight list of all users (counts + app version) for overview/list views. */
  getUserStatsSummary: () => Promise<UserStatsSummaryModel[]>;
  /** Full stats (including addin arrays) for a single user, loaded on demand. */
  getUserStats: (userEmail: string) => Promise<UserStatsModel | undefined>;
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
    discipline: string,
  ) => Promise<UserModel>;
  getUser: (userEmail: string) => Promise<UserModel | undefined>;
  setAllowedAddinPathsForUser: (
    userEmail: string,
    addinPaths: string[],
  ) => Promise<void>;
  setBlockedAddinPathsForUser: (
    userEmail: string,
    addinPaths: string[],
  ) => Promise<void>;
  /** Blocks an addin path for all users except admins. */
  blockAddinPathForAllUsers: (addinPath: string) => Promise<void>;
  /** Unblocks an addin path for all users. */
  unblockAddinPathForAllUsers: (addinPath: string) => Promise<void>;
  isUserAdmin: () => Promise<boolean>;
  isUserSuperAdmin: () => Promise<boolean>;

  isOtherUserAdmin: (userEmail: string) => Promise<boolean>;
  isOtherUserSuperAdmin: (userEmail: string) => Promise<boolean>;
  /** Remove the user from the stats db so that they do not appear at all on the stats page. This is only available to admins. */
  unregisterUser: (userEmail: string) => Promise<void>;
  createPackageForRegistryAddin: (
    addin: AddinModel,
    request: CreateAddinPackageRequestModel,
  ) => Promise<void>;
  getAllAddinPackages: () => Promise<AddinPackageInfoModel[]>;
  getPackageInfoForRegistryAddin: (
    addin: AddinModel,
  ) => Promise<AddinPackageInfoModel | undefined>;
  checkFileExists: (filePath: string) => Promise<boolean>;
  loadImageDataForPackage: (
    pkg: AddinPackageInfoModel,
  ) => Promise<[number[], string]>;
  openHelpFileForPackage: (pkg: AddinPackageInfoModel) => Promise<void>;
  regenerateZipFilesInRegistry: () => Promise<void>;
  getDevVisualStudioTemplates: () => Promise<VsTemplateModel[]>;
  installDevVisualStudioTemplates: (
    templates: VsTemplateModel[],
  ) => Promise<void>;
  getAllDevCodeSnippets: () => Promise<CodeSnippetAndGroupsModel>;
  addDevCodeSnippet: (snippet: CodeSnippetModel) => Promise<void>;
  createDevCodeSnippetGroup: (groupPath: string) => Promise<void>;
  removeDevCodeSnippet: (snippet: CodeSnippetModel) => Promise<void>;
  editDevCodeSnippet: (
    oldSnippet: CodeSnippetModel,
    newSnippet: CodeSnippetModel,
  ) => Promise<void>;
  removeDevCodeSnippetGroup: (groupPath: string) => Promise<void>;
  /** Throws an error if the server is not connected */
  ensureConnectedToServer: () => Promise<void>;
  updateUserAppVersionMetadata: () => Promise<void>;
  getUserMetadata: (userEmail: string) => Promise<UserMetadataModel>;
  getUserMetadataMany: (userEmails: string[]) => Promise<UserMetadataModel[]>;
  loginCheckIfPasswordIsSetForSelf: () => Promise<boolean>;
  loginCheckIfPasswordIsSetForUser: (userEmail: string) => Promise<boolean>;
  loginSetPassword: (password: string) => Promise<void>;
  loginVerifyPasswordForUser: (
    userEmail: string,
    password: string,
  ) => Promise<boolean>;
  loginSetTempPasswordForUser: (userEmail: string) => Promise<void>;
  createHelpTicket: (request: CreateHelpTicketRequestModel) => Promise<string>;
  getHelpTicketPreviews: () => Promise<HelpTicketPreviewModel[]>;
  getHelpTicketWithId: (id: string) => Promise<HelpTicketModel>;
  addHelpTicketMessage: (
    request: AddHelpTicketMessageRequestModel,
  ) => Promise<void>;
  setHelpTicketStatus: (id: string, status: HelpTicketStatus) => Promise<void>;
  purgeClosedHelpTickets: () => Promise<void>;
  removeNonexistantTicketsFromConfig: () => Promise<void>;
  getOwnedTicketPreviews: () => Promise<HelpTicketPreviewModel[]>;
  loadHelpTicketImage: (absolutePath: string) => Promise<[number[], string]>;
  checkForTicketUpdates: (
    userEmail: string,
    includeStatusChanges: boolean,
    isAdmin: boolean,
  ) => Promise<HelpTicketUpdateNotificationModel[]>;
}

export default function getTauriCommands(): TauriCommands {
  const kvStoreSet = async <K extends ConfigKey>(
    key: K,
    value: ConfigKeys[K],
  ) => {
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
    key: string,
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
    uninstallRequests: UninstallAddinRequestModel[],
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
    destinationDir: string,
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

  const listAddinReplacementYears = async (
    destination: string,
    addinName: string,
  ) => {
    return await invoke<ReplacementYearModel[]>("list_addin_replacement_years", {
      destination,
      addinName,
    });
  };

  const setAddinReplacementDlls = async (
    destination: string,
    addinName: string,
    year: string,
    sourcePaths: string[],
  ) => {
    return await invoke<void>("set_addin_replacement_dlls", {
      destination,
      addinName,
      year,
      sourcePaths,
    });
  };

  const removeAddinReplacementDlls = async (
    destination: string,
    addinName: string,
    year: string,
  ) => {
    return await invoke<void>("remove_addin_replacement_dlls", {
      destination,
      addinName,
      year,
    });
  };

  const removeAddinReplacementDllFile = async (
    destination: string,
    addinName: string,
    year: string,
    fileName: string,
  ) => {
    return await invoke<void>("remove_addin_replacement_dll_file", {
      destination,
      addinName,
      year,
      fileName,
    });
  };

  const createUserStats = async () => {
    return await invoke<UserStatsModel>("create_user_stats");
  };

  const updateUserStats = async () => {
    return await invoke<UserStatsModel | undefined>("update_user_stats");
  };

  const syncUserStats = async () => {
    return await invoke<void>("sync_user_stats");
  };

  const doesUserExist = async (userEmail: string) => {
    return await invoke<boolean>("does_user_exist", { userEmail });
  };

  const getAllUserStats = async () => {
    return await invoke<UserStatsModel[]>("get_all_user_stats");
  };

  const getUserStatsSummary = async () => {
    return await invoke<UserStatsSummaryModel[]>("get_user_stats_summary");
  };

  const getUserStats = async (userEmail: string) => {
    return await invoke<UserStatsModel | undefined>("get_user_stats", {
      userEmail,
    });
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
    userDiscipline: string,
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

  const setAllowedAddinPathsForUser = async (
    userEmail: string,
    addinPaths: string[],
  ) => {
    return await invoke<void>("set_allowed_addin_paths", {
      userEmail,
      addinPaths,
    });
  };

  const setBlockedAddinPathsForUser = async (
    userEmail: string,
    addinPaths: string[],
  ) => {
    return await invoke<void>("set_blocked_addin_paths", {
      userEmail,
      addinPaths,
    });
  };

  const blockAddinPathForAllUsers = async (addinPath: string) => {
    return await invoke<void>("block_addin_path_for_all_users", { addinPath });
  };

  const unblockAddinPathForAllUsers = async (addinPath: string) => {
    return await invoke<void>("unblock_addin_path_for_all_users", {
      addinPath,
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

  const createPackageForRegistryAddin = async (
    addin: AddinModel,
    request: CreateAddinPackageRequestModel,
  ) => {
    return await invoke<void>("create_package_for_registry_addin", {
      addin,
      request,
    });
  };

  const getAllAddinPackages = async () => {
    return await invoke<AddinPackageInfoModel[]>("get_all_addin_packages");
  };

  const getPackageInfoForRegistryAddin = async (addin: AddinModel) => {
    return await invoke<AddinPackageInfoModel | undefined>(
      "get_package_info_for_registry_addin",
      { addin },
    );
  };

  const checkFileExists = async (filePath: string) => {
    return await invoke<boolean>("check_file_exists", { filePath });
  };

  const openHelpFileForPackage = async (pkg: AddinPackageInfoModel) => {
    return await invoke<void>("open_help_file_for_package", { package: pkg });
  };

  const loadImageDataForPackage = async (pkg: AddinPackageInfoModel) => {
    return await invoke<[number[], string]>("load_image_data_for_package", {
      package: pkg,
    });
  };

  const getDevVisualStudioTemplates = async () => {
    return await invoke<VsTemplateModel[]>("get_dev_visual_studio_templates");
  };

  const regenerateZipFilesInRegistry = async () => {
    return await invoke<void>("regenerate_zip_files_in_registry");
  };

  const installDevVisualStudioTemplates = async (
    templates: VsTemplateModel[],
  ) => {
    return await invoke<void>("install_dev_visual_studio_templates", {
      templates,
    });
  };

  const getAllDevCodeSnippets = async () => {
    return await invoke<CodeSnippetAndGroupsModel>("get_all_dev_code_snippets");
  };

  const addDevCodeSnippet = async (snippet: CodeSnippetModel) => {
    return await invoke<void>("add_dev_code_snippet", { snippet });
  };

  const createDevCodeSnippetGroup = async (groupPath: string) => {
    return await invoke<void>("create_dev_code_snippet_group", { groupPath });
  };

  const editDevCodeSnippet = async (
    oldSnippet: CodeSnippetModel,
    newSnippet: CodeSnippetModel,
  ) => {
    return await invoke<void>("edit_dev_code_snippet", {
      oldSnippet,
      newSnippet,
    });
  };

  const removeDevCodeSnippet = async (snippet: CodeSnippetModel) => {
    return await invoke<void>("remove_dev_code_snippet", { snippet });
  };

  const removeDevCodeSnippetGroup = async (groupPath: string) => {
    return await invoke<void>("remove_dev_code_snippet_group", { groupPath });
  };

  const ensureConnectedToServer = async () => {
    return await invoke<void>("ensure_connected_to_server");
  };

  const updateUserAppVersionMetadata = async () => {
    return await invoke<void>("update_user_app_version_metadata");
  };

  const getUserMetadata = async (userEmail: string) => {
    return await invoke<UserMetadataModel>("get_user_metadata", { userEmail });
  };

  const getUserMetadataMany = async (userEmails: string[]) => {
    return await invoke<UserMetadataModel[]>("get_user_metadata_many", {
      userEmails,
    });
  };

  const loginCheckIfPasswordIsSetForSelf = async () => {
    return await invoke<boolean>("login_check_if_password_is_set_for_self");
  };

  const loginCheckIfPasswordIsSetForUser = async (userEmail: string) => {
    return await invoke<boolean>("login_check_if_password_is_set_for_user", {
      userEmail,
    });
  };

  const loginSetPassword = async (password: string) => {
    return await invoke<void>("login_set_password", { password });
  };

  const loginVerifyPasswordForUser = async (
    userEmail: string,
    password: string,
  ) => {
    return await invoke<boolean>("login_verify_password_for_user", {
      userEmail,
      password,
    });
  };

  /// Should only be used by admins
  const loginSetTempPasswordForUser = async (userEmail: string) => {
    return await invoke<void>("login_set_temp_password_for_user", {
      userEmail,
    });
  };

  const createHelpTicket = async (request: CreateHelpTicketRequestModel) => {
    return await invoke<string>("create_ticket", { request });
  };

  const getHelpTicketPreviews = async () => {
    return await invoke<HelpTicketPreviewModel[]>("get_ticket_previews");
  };

  const getHelpTicketWithId = async (id: string) => {
    return await invoke<HelpTicketModel>("get_ticket_with_id", { id });
  };

  const addHelpTicketMessage = async (
    request: AddHelpTicketMessageRequestModel,
  ) => {
    return await invoke<void>("add_message", { request });
  };

  const setHelpTicketStatus = async (id: string, status: HelpTicketStatus) => {
    return await invoke<void>("set_ticket_status", { id, status });
  };

  const purgeClosedHelpTickets = async () => {
    return await invoke<void>("purge_closed_tickets");
  };

  const removeNonexistantTicketsFromConfig = async () => {
    return await invoke<void>("remove_nonexistant_tickets_from_config");
  };

  const getOwnedTicketPreviews = async () => {
    return await invoke<HelpTicketPreviewModel[]>("get_owned_ticket_previews");
  };

  const loadHelpTicketImage = async (absolutePath: string) => {
    return await invoke<[number[], string]>("load_help_ticket_image", {
      absolutePath,
    });
  };

  const checkForTicketUpdates = async (
    userEmail: string,
    includeStatusChanges: boolean,
    isAdmin: boolean,
  ) => {
    return await invoke<HelpTicketUpdateNotificationModel[]>(
      "check_for_ticket_updates",
      { userEmail, includeStatusChanges, isAdmin },
    );
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
    listAddinReplacementYears,
    setAddinReplacementDlls,
    removeAddinReplacementDlls,
    removeAddinReplacementDllFile,
    createUserStats,
    doesUserExist,
    updateUserStats,
    syncUserStats,
    getAllUserStats,
    getUserStatsSummary,
    getUserStats,
    changeUserStatsEmail,
    changeUserStatsName,
    checkForUpdatesManual,
    isRevitRunning,
    getPendingUpdatesInfo,
    registerUser,
    getUser,
    setAllowedAddinPathsForUser,
    setBlockedAddinPathsForUser,
    blockAddinPathForAllUsers,
    unblockAddinPathForAllUsers,
    isUserAdmin,
    isUserSuperAdmin,
    isOtherUserAdmin,
    isOtherUserSuperAdmin,
    unregisterUser,
    createPackageForRegistryAddin,
    getAllAddinPackages,
    getPackageInfoForRegistryAddin,
    checkFileExists,
    loadImageDataForPackage,
    openHelpFileForPackage,
    getDevVisualStudioTemplates,
    installDevVisualStudioTemplates,
    getAllDevCodeSnippets,
    addDevCodeSnippet,
    createDevCodeSnippetGroup,
    removeDevCodeSnippet,
    editDevCodeSnippet,
    removeDevCodeSnippetGroup,
    ensureConnectedToServer,
    updateUserAppVersionMetadata,
    getUserMetadata,
    getUserMetadataMany,
    loginCheckIfPasswordIsSetForSelf,
    loginCheckIfPasswordIsSetForUser,
    loginSetPassword,
    loginVerifyPasswordForUser,
    loginSetTempPasswordForUser,
    regenerateZipFilesInRegistry,
    createHelpTicket,
    getHelpTicketPreviews,
    getHelpTicketWithId,
    addHelpTicketMessage,
    setHelpTicketStatus,
    purgeClosedHelpTickets,
    removeNonexistantTicketsFromConfig,
    getOwnedTicketPreviews,
    loadHelpTicketImage,
    checkForTicketUpdates,
  };
}
