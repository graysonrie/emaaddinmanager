import {
  UserResponseModel,
  UserRole,
} from "./user/responses/user-response.model";
import * as Requests from "./user/requests";
import { serverRequest } from "./server-request";
import { SERVER_ENDPOINTS } from ".";

interface ServerCommands {
  getUserClaims: () => Promise<object>;
  getUsers: () => Promise<UserResponseModel[]>;
  getSelf: () => Promise<UserResponseModel>;
  createSelf: (
    request: Requests.CreateUserRequestModel
  ) => Promise<UserResponseModel>;
  createSelfAsAdmin: (
    request: Requests.CreateUserRequestWithRoleModel
  ) => Promise<UserResponseModel>;
  updateUsername: (
    request: Requests.UpdateUserNameRequestModel
  ) => Promise<UserResponseModel>;
  deleteUser: (request: Requests.DeleteUserRequestModel) => Promise<void>;
  getRole: () => Promise<UserRole>;
  getRoleFromEmail: (email: string) => Promise<UserRole>;
}

export default function getServerCommands(): ServerCommands {
  const getUserClaims = async () => {
    return await serverRequest<object>("USER_CLAIMS", "GET");
  };
  const getUsers = async () => {
    return await serverRequest<UserResponseModel[]>("USER_GET_USERS", "GET");
  };
  const getSelf = async () => {
    return await serverRequest<UserResponseModel>("USER_ME", "GET");
  };
  const createSelf = async (request: Requests.CreateUserRequestModel) => {
    return await serverRequest<UserResponseModel>(
      "USER_CREATE_ME",
      "POST",
      request
    );
  };
  const createSelfAsAdmin = async (
    request: Requests.CreateUserRequestWithRoleModel
  ) => {
    return await serverRequest<UserResponseModel>(
      "USER_CREATE_ME_AS_ADMIN",
      "POST",
      request
    );
  };
  const updateUsername = async (
    request: Requests.UpdateUserNameRequestModel
  ) => {
    return await serverRequest<UserResponseModel>(
      "USER_UPDATE_ME",
      "PUT",
      request
    );
  };
  const deleteUser = async (request: Requests.DeleteUserRequestModel) => {
    return await serverRequest<void>("USER_DELETE_USER", "DELETE", request);
  };
  const getRole = async () => {
    const role = await serverRequest<string>("USER_GET_ROLE", "GET");
    switch (role) {
      case "User":
        return "user";
      case "Admin":
        return "admin";
      case "SuperAdmin":
        return "superAdmin";
    }
    throw new Error("Invalid role");
  };
  const getRoleFromEmail = async (email: string) => {
    const role = await serverRequest<string>(
      "USER_GET_ROLE_FROM_EMAIL",
      "GET",
      { email }
    );
    return role as UserRole;
  };
  return {
    getUserClaims,
    getUsers,
    getSelf,
    createSelf,
    createSelfAsAdmin,
    updateUsername,
    deleteUser,
    getRole,
    getRoleFromEmail,
  };
}
