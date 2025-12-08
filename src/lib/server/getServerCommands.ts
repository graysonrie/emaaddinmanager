export interface CreateDirectoryRequest {
  path: string;
}

export interface AskQuestionRequest {
  question: string;
}

export type UserRole = "SuperAdmin" | "Admin" | "User";

export interface UserResponse {
  email: string;
  name: string;
  role: UserRole;
  disciplines: string[];
}

export interface CreateUserRequestWithRole {
  name: string;
  disciplines: string[];
  role: string;
  adminKey: string;
}

export interface CreateUserRequest {
  name: string;
  disciplines: string[];
}

export interface FilePathIdentifierModel {
  relativePath: string;
}

export interface AddinPermission {
  id: string;
  addinId: string;
}

export interface UserModel {
  id: string;
  email: string;
  name: string;
  disciplines: string[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  stats: UserStats;
  addinPermissions: AddinPermission[];
}

export interface AddinModel {
  id: string;
  pathToAddinXmlFile: FilePathIdentifierModel;
  pathToAddinDllFolder: FilePathIdentifierModel;
  owner: UserModel;
  isInstalledLocally: boolean;
  isPackage: boolean;
  name: string;
}

export interface PublishedAddinModel {
  addin: AddinModel;
  datePublished: Date;
}

export interface LocalAddinModel {
  pathToAddinDllFolder: string;
  pathToAddinXmlFile: string;
}

export interface UserStats {
  publishedAddins: PublishedAddinModel[];
  installedAddins: LocalAddinModel[];
}

export interface UserModel {
  id: string;
  email: string;
  name: string;
  disciplines: string[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  stats: UserStats;
  addinPermissions: AddinPermission[];
}

export interface UpdateUserNameRequest {
  name: string;
}

export interface DeleteUserRequest {
  email: string;
}

export interface GetUserRoleRequest {
  email: string;
}

export interface AddinResponse {
  model: AddinModel;
}

export interface DownloadAddinRequest {
  addinName: string;
  revitVersions: string[];
}

export interface RevitAddinXmlModel {
  name: string;
  addinType: string;
  addInId: string;
  fullClassName: string;
  vendorId: string;
  vendorDescription: string;
  vendorEmail: string;
  addinVersion: string;
}

export interface FileNameRecord {
  nameWithExtension: string;
  fileBytes: Uint8Array;
}

export interface PublishAddinRequest {
  revitAddinXml: RevitAddinXmlModel;
  revitVersions: string[];
  dllFiles: FileNameRecord[];
}

export interface DisciplineModel {
  id: string;
  forAddins: AddinModel[];
  displayName: string;
  emoji: string;
}

export interface AddDisciplesRequest {
  disciplines: DisciplineModel[];
}

interface ServerCommands {
  login: () => Promise<void>;
  authCallback: () => Promise<void>;
  logout: () => Promise<void>;
  getTokens: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  createDirectory: (input: CreateDirectoryRequest) => Promise<void>;
  askStreaming: (input: AskQuestionRequest) => Promise<void>;
  getClaims: () => Promise<object>;
  getUsers: () => Promise<UserResponse>;
  getCurrentUser: () => Promise<UserResponse>;
  createSelfAsAdmin: (input: CreateUserRequestWithRole) => Promise<void>;
  createSelf: (input: CreateUserRequest) => Promise<UserModel>;
  updateUserName: (input: UpdateUserNameRequest) => Promise<UserResponse>;
  deleteUser: (input: DeleteUserRequest) => Promise<object>;
  getUserRole: () => Promise<string>;
  getUserRoleFromEmail: (input: GetUserRoleRequest) => Promise<string>;
  getAllAddins: () => Promise<AddinResponse>;
  getMyAddins: () => Promise<AddinResponse>;
  downloadAddin: (input: DownloadAddinRequest) => Promise<void>;
  deleteAddin: (id: string) => Promise<void>;
  publishAddin: (input: PublishAddinRequest) => Promise<AddinResponse>;
  getDisciplines: () => Promise<DisciplineModel>;
  addDiscipline: (input: DisciplineModel) => Promise<DisciplineModel>;
  addDisciplines: (input: AddDisciplesRequest) => Promise<DisciplineModel>;
}

export default function getServerCommands(): ServerCommands {
  const login = async () => {
    return await serverRequest<void>(`api/Auth/login`, "GET");
  };
  const authCallback = async () => {
    return await serverRequest<void>(`api/Auth/auth-callback`, "GET");
  };
  const logout = async () => {
    return await serverRequest<void>(`api/Auth/logout`, "GET");
  };
  const getTokens = async () => {
    return await serverRequest<void>(`api/Auth/tokens`, "GET");
  };
  const getUserInfo = async () => {
    return await serverRequest<void>(`api/Auth/userinfo`, "GET");
  };
  const createDirectory = async (input: CreateDirectoryRequest) => {
    return await serverRequest<void>(`api/FileApi/create-dir`, "POST", input);
  };
  const askStreaming = async (input: AskQuestionRequest) => {
    return await serverRequest<void>(
      `api/RevitAI/ask-streaming`,
      "POST",
      input
    );
  };
  const getClaims = async () => {
    return await serverRequest<object>(`api/User/claims`, "GET");
  };
  const getUsers = async () => {
    return await serverRequest<UserResponse>(`api/User/get-users`, "GET");
  };
  const getCurrentUser = async () => {
    return await serverRequest<UserResponse>(`api/User/me`, "GET");
  };
  const createSelfAsAdmin = async (input: CreateUserRequestWithRole) => {
    return await serverRequest<void>(
      `api/User/create-me-as-admin`,
      "POST",
      input
    );
  };
  const createSelf = async (input: CreateUserRequest) => {
    return await serverRequest<UserModel>(`api/User/create-me`, "POST", input);
  };
  const updateUserName = async (input: UpdateUserNameRequest) => {
    return await serverRequest<UserResponse>(
      `api/User/update-me`,
      "POST",
      input
    );
  };
  const deleteUser = async (input: DeleteUserRequest) => {
    return await serverRequest<object>(`api/User/delete-user`, "POST", input);
  };
  const getUserRole = async () => {
    return await serverRequest<string>(`api/User/get-role`, "GET");
  };
  const getUserRoleFromEmail = async (input: GetUserRoleRequest) => {
    return await serverRequest<string>(
      `api/User/get-role-from-email`,
      "GET",
      input
    );
  };
  const getAllAddins = async () => {
    return await serverRequest<AddinResponse>(`api/Addins`, "GET");
  };
  const getMyAddins = async () => {
    return await serverRequest<AddinResponse>(`api/Addins/my-addins`, "GET");
  };
  const downloadAddin = async (input: DownloadAddinRequest) => {
    return await serverRequest<void>(`api/Addins/download`, "POST", input);
  };
  const deleteAddin = async (id: string) => {
    return await serverRequest<void>(`api/Addins/${id}`, "DELETE");
  };
  const publishAddin = async (input: PublishAddinRequest) => {
    return await serverRequest<AddinResponse>(
      `api/Addins/publish`,
      "POST",
      input
    );
  };
  const getDisciplines = async () => {
    return await serverRequest<DisciplineModel>(`api/Disciplines`, "GET");
  };
  const addDiscipline = async (input: DisciplineModel) => {
    return await serverRequest<DisciplineModel>(
      `api/Disciplines/add`,
      "POST",
      input
    );
  };
  const addDisciplines = async (input: AddDisciplesRequest) => {
    return await serverRequest<DisciplineModel>(
      `api/Disciplines/add-multiple`,
      "POST",
      input
    );
  };
  return {
    login,
    authCallback,
    logout,
    getTokens,
    getUserInfo,
    createDirectory,
    askStreaming,
    getClaims,
    getUsers,
    getCurrentUser,
    createSelfAsAdmin,
    createSelf,
    updateUserName,
    deleteUser,
    getUserRole,
    getUserRoleFromEmail,
    getAllAddins,
    getMyAddins,
    downloadAddin,
    deleteAddin,
    publishAddin,
    getDisciplines,
    addDiscipline,
    addDisciplines,
  };
}
export async function serverRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  retry = true
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5043";
  try {
    const url = `${baseUrl}/${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    // If unauthorized and we haven't retried yet, the token might be expired
    if (response.status === 401 && retry) {
      console.log("Token might be expired, attempting to refresh...");

      // The server middleware will handle token refresh automatically
      // Just retry the request once
      return serverRequest<T>(endpoint, method, body, false);
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json() as T;
  } catch (error) {
    console.warn("Request failed:", error);
    throw error;
  }
}
