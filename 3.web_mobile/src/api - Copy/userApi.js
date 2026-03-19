import { post, get, patch, deleteRequest } from "./restApi";
import { base_api } from "./config";

export const getListUser = (payload) => {
  return get(`users/get-list`, { ...payload });
};
export const getPermissions = () => {
  return get(`users/get-permissions`, {});
};
export const getUserBranchs = (userId) => {
  return patch(`users/get-branchs/${userId}`, {});
};
export const getDataUser = () => {
  return get(`users/get-data-user`, {});
};
export const getPermissisonByUsers = () => {
  return get(`users/get-permission-by-user`, {});
};
export const getUserByIdPopulate = (userId) => {
  return get(`users/get-by-id-populate/${userId}`, {});
};
export const updateUser = (userId, payload) => {
  return patch(`/users/update/${userId}`, payload);
};
