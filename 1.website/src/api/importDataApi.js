import { post, get, patch, deleteRequest, postData } from './restApi';
import { baseURL } from "./config";


export const uploadAssetMaintenanceExcel = (_body) => {
    return postData('importData/upload', _body);
}