import { post, get, patch, deleteRequest } from './restApi';
import { base_api } from "./config";
export const getAllCategory = (payload) => {
    return get(`category/get-all`, { ...payload });
}

