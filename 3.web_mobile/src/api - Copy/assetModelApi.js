import { post, get, patch, deleteRequest } from './restApi';
import { base_api } from "./config";
export const getAllAssetModel = (payload) => {
    return get(`assetModel/get-all`, { ...payload });
}

