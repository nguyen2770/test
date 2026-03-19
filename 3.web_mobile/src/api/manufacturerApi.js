import { post, get, patch, deleteRequest } from "./restApi";
import { base_api } from "./config";

export const getAllManufacturer = (payload) => {
  return get(`manufacturer/get-all`, { ...payload });
};
