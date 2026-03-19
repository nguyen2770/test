import { post, get, patch, deleteRequest } from './restApi';
import { base_api } from './config';


export const getListAssetModelDocuments = (payload) => {
    return get(`assetModelDocument/get-list`, { ...payload });
}
export const getAssetModelDocumentByAssetModel = (payload) => {
    return get(`assetModelDocument/getAll`, { ...payload });
}
export const getAssetModelDocumentById = (payload) => {
    return get(`assetModelDocument/get-by-id`, { ...payload });
}