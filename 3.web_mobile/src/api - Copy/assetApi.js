import { post, get, patch, deleteRequest } from './restApi';
import { base_api } from "./config";

export const getAllAsset = (payload) => {
    return get(`asset/get-all`, { ...payload });
}

